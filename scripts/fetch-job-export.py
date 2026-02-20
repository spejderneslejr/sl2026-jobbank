#!/usr/bin/env python3
"""
Fetch job export from CampOS API and generate jobs-export.json

This script fetches data from the CampOS API:
- Job export: Contains job data with organization references
- Organization export: Contains organization hierarchy (parent_path)

And generates:
- jobs-export.json (for use by the jobbank Vue app)

Configuration:
- API credentials are stored in config.json (not committed to git)
- See config.example.json for the required structure

Usage:
    python3 scripts/fetch-job-export.py
"""

import html as html_module
import json
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError


class JobExportFetcher:
    """Fetch job export data from CampOS API and generate JSON"""

    # Organization name overrides - matches config/org-overrides.js
    ORG_NAME_OVERRIDES = {
        'Havet': 'Havet (underlejr)',
        'Skoven': 'Skoven (underlejr)',
        'Byen': 'Byen (underlejr)',
        'Landet': 'Landet (underlejr)',
    }

    def __init__(self, config_file, output_file):
        self.config_file = config_file
        self.output_file = output_file
        self.org_lookup = {}
        self.config = None

    def load_config(self):
        """Load API configuration from config.json"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)

            # Validate required fields
            required_fields = ['job_export_url', 'org_export_url']
            missing_fields = [f for f in required_fields if f not in self.config]
            if missing_fields:
                print(f"Error: Missing required fields in {self.config_file}: {', '.join(missing_fields)}")
                print("Please see config.example.json for the required structure")
                sys.exit(1)

            print(f"Loaded configuration from {self.config_file}")
            return True

        except FileNotFoundError:
            print(f"Error: Configuration file not found: {self.config_file}")
            print("Please create config.json based on config.example.json")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in {self.config_file}: {e}")
            sys.exit(1)

    def fetch_json(self, url):
        """Fetch JSON data from a URL"""
        try:
            req = Request(url)
            req.add_header('User-Agent', 'JobBank/1.0')

            with urlopen(req, timeout=30) as response:
                data = response.read()
                return json.loads(data.decode('utf-8'))

        except HTTPError as e:
            print(f"HTTP Error {e.code}: {e.reason}")
            print(f"URL: {url}")
            sys.exit(1)
        except URLError as e:
            print(f"URL Error: {e.reason}")
            print(f"URL: {url}")
            sys.exit(1)
        except Exception as e:
            print(f"Error fetching data: {e}")
            sys.exit(1)

    def format_date_danish(self, iso_date_string):
        """Convert ISO date string to Danish format (DD-MM-YYYY)

        Example: '2025-05-06T23:59:57.525504+02:00' -> '06-05-2025'
        """
        if not iso_date_string:
            return None

        try:
            # Parse ISO format (handles timezone)
            dt = datetime.fromisoformat(iso_date_string)
            return dt.strftime('%d-%m-%Y')
        except (ValueError, AttributeError):
            return None

    def extract_org_id_from_path(self, path):
        """Extract the last organization ID from the path

        Example: '1/2/6/55/131/' -> '131'
        """
        if not path:
            return None
        # Remove trailing slash and split
        parts = path.rstrip('/').split('/')
        # Return the last part
        return parts[-1] if parts else None

    def apply_org_name_override(self, org_name):
        """Apply organization name overrides if configured

        Example: 'Havet' -> 'Havet (underlejr)'
        """
        if not org_name:
            return org_name

        # Check for exact match override
        if org_name in self.ORG_NAME_OVERRIDES:
            return self.ORG_NAME_OVERRIDES[org_name]

        return org_name

    def clean_org_name(self, org_name):
        """Remove numeric prefix from organization name and apply overrides

        Example: '5532 - GRAS' -> 'GRAS'
        Returns: (numeric_id, clean_name)
        """
        if not org_name:
            return None, None

        # Match pattern: "5532 - GRAS", "0050 Korpsansatte", or just "GRAS"
        match = re.match(r'^(\d+)\s*(?:-\s*)?(.+)$', org_name)
        if match:
            clean_name = match.group(2).strip()
            # Apply overrides after cleaning
            clean_name = self.apply_org_name_override(clean_name)
            return match.group(1), clean_name

        # No numeric prefix, just apply overrides
        clean_name = org_name.strip()
        clean_name = self.apply_org_name_override(clean_name)
        return None, clean_name

    def build_org_lookup(self, org_data):
        """Build organization name -> path lookup from org export data

        The org export has structure: [{"name": "5532 - GRAS", "parent_path": "1/2/6/55/131/"}, ...]
        We create a lookup by organization name to get the parent_path
        """
        print(f"Building organization lookup from {len(org_data)} organizations...")

        for org in org_data:
            org_name = org.get('name')
            org_path = org.get('parent_path')

            if org_name:
                # Store both by full name for exact matching
                self.org_lookup[org_name] = org_path

        print(f"Built lookup for {len(self.org_lookup)} organizations")

    def build_org_map(self):
        """Build a mapping from every org ID to its top-level area (short) name.

        This allows ?organization=nnn redirects from the old site to filter
        to the correct area, regardless of whether nnn is an area, committee,
        team, or workgroup.

        Path structure (from parent_path):
          "1/"           -> root (skip)
          "1/2/"         -> camp level (skip)
          "1/2/9/"       -> area level  (ID 9 maps to itself)
          "1/2/9/27/"    -> committee   (ID 27 maps to area 9)
          "1/2/9/27/28/" -> team        (ID 28 maps to area 9)

        Returns: dict {org_id_str: area_short_name}
        """
        # Build reverse lookup: org_id -> full_name
        org_id_to_name = {}
        for name, path in self.org_lookup.items():
            org_id = self.extract_org_id_from_path(path)
            if org_id:
                org_id_to_name[org_id] = name

        org_map = {}

        for name, path in self.org_lookup.items():
            if not path:
                continue

            own_id = self.extract_org_id_from_path(path)
            if not own_id:
                continue

            # Strip the two fixed top levels: 1 (Spejderne root) and 2 (SL2026)
            parts = path.rstrip('/').split('/')
            if len(parts) < 3:
                # Root or camp level — no area to map to
                continue
            parts = parts[2:]  # Now: [area_id, ...] or [area_id, committee_id, ...]

            area_id = parts[0]
            area_full_name = org_id_to_name.get(area_id)
            if not area_full_name:
                continue

            _, area_short_name = self.clean_org_name(area_full_name)
            if area_short_name:
                org_map[own_id] = area_short_name

        print(f"Built org_map for {len(org_map)} org IDs")
        return org_map

    def get_org_hierarchy_for_job(self, org_name):
        """Get full organizational hierarchy for a job

        Path structure:
        - Camp level: Ignored(1)/Lejr(2)/
        - Area level: Ignored(1)/Lejr(2)/Area(6)/
        - Committee level: Ignored(1)/Lejr(2)/Area(6)/Committee(55)/
        - Team level: Ignored(1)/Lejr(2)/Area(6)/Committee(55)/Team(131)/
        - Workgroup level: Ignored(1)/Lejr(2)/Area(6)/Committee(55)/Team(131)/Workgroup(456)/

        Returns: dict with area, committee, team, workgroup info
        """
        # Look up the org_path by organization name
        org_path = self.org_lookup.get(org_name)

        if not org_path:
            return {
                'area': 'Unknown',
                'area_full': 'Unknown',
                'committee': None,
                'committee_full': None,
                'team': None,
                'team_full': None,
                'workgroup': None,
                'workgroup_full': None,
                'full_path': [org_name]
            }

        # Parse the path: 1/2/6/55/131/456/
        parts = org_path.rstrip('/').split('/')

        # Remove first level (1=ignored)
        if len(parts) > 1:
            parts = parts[1:]  # Now: [2, 6, 55, 131, 456] or [2] for camp-level

        hierarchy = {
            'area': None,
            'area_full': None,
            'committee': None,
            'committee_full': None,
            'team': None,
            'team_full': None,
            'workgroup': None,
            'workgroup_full': None,
            'full_path': []
        }

        # Check if this is a camp-level job (only has ID 2)
        if len(parts) == 1 and parts[0] == '2':
            # Camp-level job - use special name
            clean_camp_name = self.clean_org_name(org_name)[1] or 'Spejdernes Lejr 2026'
            hierarchy['area'] = clean_camp_name
            hierarchy['area_full'] = org_name
            hierarchy['full_path'].append(clean_camp_name)
            return hierarchy

        # Remove camp level (2=lejr root) for regular jobs
        if len(parts) > 1:
            parts = parts[1:]  # Now: [6, 55, 131, 456]

        # We need to look up the org names for each ID in the path
        # Build a reverse lookup: org_id -> org_name
        org_id_lookup = {}
        for name, path in self.org_lookup.items():
            org_id = self.extract_org_id_from_path(path)
            if org_id:
                org_id_lookup[org_id] = name

        # Map path indices to levels
        # parts[0] = Area (level 3)
        # parts[1] = Committee (level 4) if exists
        # parts[2] = Team (level 5) if exists
        # parts[3] = Workgroup (level 6) if exists

        for idx, org_id in enumerate(parts):
            org_full_name = org_id_lookup.get(org_id, f"ID-{org_id}")
            org_numeric_id, org_clean_name = self.clean_org_name(org_full_name)

            if idx == 0:
                hierarchy['area'] = org_clean_name
                hierarchy['area_full'] = org_full_name
                hierarchy['full_path'].append(org_clean_name)
            elif idx == 1:
                hierarchy['committee'] = org_clean_name
                hierarchy['committee_full'] = org_full_name
                hierarchy['full_path'].append(org_clean_name)
            elif idx == 2:
                hierarchy['team'] = org_clean_name
                hierarchy['team_full'] = org_full_name
                hierarchy['full_path'].append(org_clean_name)
            elif idx == 3:
                hierarchy['workgroup'] = org_clean_name
                hierarchy['workgroup_full'] = org_full_name
                hierarchy['full_path'].append(org_clean_name)

        # Fallback to org name if nothing found
        if not hierarchy['area']:
            hierarchy['area'] = self.clean_org_name(org_name)[1] or 'Unknown'
            hierarchy['area_full'] = org_name

        return hierarchy

    def process_jobs(self, job_data):
        """Process jobs from API data"""
        print(f"Processing {len(job_data)} jobs...")

        jobs = []

        for job in job_data:
            job_id = job.get('id')
            job_name = job.get('name', 'Unnamed Job')
            org_name = job.get('organization_id', 'Unknown')

            # Get organizational hierarchy
            org_hierarchy = self.get_org_hierarchy_for_job(org_name)

            # Format dates
            create_date_iso = None
            create_date_danish = None
            if job.get('create_date'):
                create_date_iso = job.get('create_date')
                create_date_danish = self.format_date_danish(create_date_iso)

            # Build job object
            job_obj = {
                "id": job_id,
                "name": job_name,
                "teaser": job.get('teaser', ''),
                "description": job.get('description', ''),
                "description_time_and_scope": job.get('description_time_and_scope', ''),
                "requirements": job.get('requirements'),
                "application_count": job.get('application_count', 0),
                "no_of_recruitment": job.get('no_of_recruitment', 0),
                "no_of_hired_employee": job.get('application_count', 0),  # Using application_count as proxy
                "min_age": job.get('min_age'),
                "website_url": job.get('website_url', ''),
                "create_date": create_date_iso,
                "formatted_create_date": create_date_danish,
                "org_hierarchy": {
                    "area": org_hierarchy['area'],
                    "area_full": org_hierarchy['area_full'],
                    "committee": org_hierarchy['committee'],
                    "committee_full": org_hierarchy['committee_full'],
                    "team": org_hierarchy['team'],
                    "team_full": org_hierarchy['team_full'],
                    "workgroup": org_hierarchy['workgroup'],
                    "workgroup_full": org_hierarchy['workgroup_full']
                }
            }

            jobs.append(job_obj)

        print(f"Processed {len(jobs)} jobs")
        return jobs

    def write_output(self, jobs, org_map):
        """Write jobs and org_map to JSON file

        Output format: {"jobs": [...], "org_map": {"9": "Infrastruktur & Beredskab (IB)", ...}}

        org_map allows the Vue app to resolve ?organization=nnn (used by the old
        CampOS site) to the correct top-level area filter.
        """
        output_path = Path(self.output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        output_data = {
            "jobs": jobs,
            "org_map": org_map,
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"Wrote {len(jobs)} jobs and {len(org_map)} org mappings to {self.output_file}")

    def build_job_slug(self, job):
        """Build a URL-friendly slug from job name + id (mirrors JS buildJobSlug in App.vue)"""
        name = (job.get('name', '') or '').lower()
        for old, new in [('æ', 'ae'), ('ø', 'oe'), ('å', 'aa'), ('é', 'e')]:
            name = name.replace(old, new)
        name = re.sub(r'[\u2011\u2013\u2014]', '-', name)  # en/em-dash variants
        name = re.sub(r'[^a-z0-9-]+', '-', name)
        name = re.sub(r'-{2,}', '-', name)
        name = name.strip('-')
        job_id = job.get('id')
        return f"{name}-{job_id}" if name else str(job_id)

    def strip_html_tags(self, text):
        """Strip HTML tags from text"""
        return re.sub(r'<[^>]+>', '', text or '').strip()

    def generate_og_pages(self, jobs, output_dir):
        """Generate per-job OG HTML pages alongside index.html.

        Reads the deployed index.html from output_dir, injects per-job OG meta
        tags, and writes {output_dir}/job/{slug}/index.html for each job.

        Skips silently if index.html is not present (e.g. local dev where
        output_dir is public/ and no build has run).
        """
        index_path = Path(output_dir) / 'index.html'
        if not index_path.exists():
            print("Skipping OG page generation: index.html not found in output directory")
            return

        base_html = index_path.read_text(encoding='utf-8')

        # Use the title already baked into the deployed index.html
        title_match = re.search(r'<title>([^<]*)</title>', base_html)
        site_title = title_match.group(1) if title_match else 'Jobbank - Spejdernes Lejr 2026'

        site_url = os.getenv('SITE_URL', 'https://jobs.spejderneslejr.dk').rstrip('/')
        og_image_url = f"{site_url}/og-jobbank.jpg"

        job_dir = Path(output_dir) / 'job'
        job_dir.mkdir(exist_ok=True)

        generated_slugs = set()

        for job in jobs:
            slug = self.build_job_slug(job)
            generated_slugs.add(slug)

            job_name = html_module.escape(job.get('name', ''))
            teaser = html_module.escape(self.strip_html_tags(job.get('teaser', ''))[:300])
            canonical_url = f"{site_url}/job/{slug}"

            # Replace <title> with job-specific title
            page_html = re.sub(
                r'<title>[^<]*</title>',
                f'<title>{job_name} — {html_module.escape(site_title)}</title>',
                base_html,
            )

            og_meta = (
                f'  <meta property="og:type" content="website" />\n'
                f'  <meta property="og:site_name" content="{html_module.escape(site_title)}" />\n'
                f'  <meta property="og:title" content="{job_name}" />\n'
                f'  <meta property="og:description" content="{teaser}" />\n'
                f'  <meta property="og:url" content="{canonical_url}" />\n'
                f'  <meta property="og:image" content="{og_image_url}" />\n'
                f'  <meta name="twitter:card" content="summary_large_image" />\n'
                f'  <meta name="twitter:title" content="{job_name}" />\n'
                f'  <meta name="twitter:description" content="{teaser}" />\n'
                f'  <meta name="description" content="{teaser}" />\n'
            )
            page_html = page_html.replace('</head>', og_meta + '</head>', 1)

            slug_dir = job_dir / slug
            slug_dir.mkdir(exist_ok=True)
            (slug_dir / 'index.html').write_text(page_html, encoding='utf-8')

        print(f"Generated {len(generated_slugs)} OG pages in {job_dir}")

        # Remove OG pages for jobs no longer in the export
        stale_count = 0
        for existing_dir in job_dir.iterdir():
            if existing_dir.is_dir() and existing_dir.name not in generated_slugs:
                shutil.rmtree(existing_dir)
                stale_count += 1
        if stale_count:
            print(f"Cleaned up {stale_count} stale OG page(s)")

    def run(self):
        """Main execution flow"""
        print("=" * 60)
        print("CampOS Job Export Fetcher")
        print("=" * 60)

        # Load configuration
        self.load_config()

        # Fetch organization data first (needed for hierarchy lookup)
        print("\nFetching organization data...")
        org_data = self.fetch_json(self.config['org_export_url'])
        print(f"Fetched {len(org_data)} organizations")

        # Build organization lookup
        self.build_org_lookup(org_data)

        # Build org ID -> area name map (for ?organization=nnn URL support)
        org_map = self.build_org_map()

        # Fetch job data
        print("\nFetching job data...")
        job_data = self.fetch_json(self.config['job_export_url'])
        print(f"Fetched {len(job_data)} jobs")

        # Process jobs
        jobs = self.process_jobs(job_data)

        # Write output
        self.write_output(jobs, org_map)

        # Generate per-job OG HTML pages (only when index.html is present)
        self.generate_og_pages(jobs, str(Path(self.output_file).parent))

        print("\n" + "=" * 60)
        print("Export complete!")
        print("=" * 60)


def main():
    """Main entry point"""
    # Get the script directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    # File paths
    config_file = script_dir / 'config.json'

    # Check for OUTPUT_DIR environment variable (for Docker)
    output_dir = os.getenv('OUTPUT_DIR')
    if output_dir:
        output_file = Path(output_dir) / 'jobs-export.json'
    else:
        # Default to project public directory
        output_file = project_root / 'public' / 'jobs-export.json'

    # Create processor and run
    processor = JobExportFetcher(config_file, output_file)
    processor.run()


if __name__ == '__main__':
    main()
