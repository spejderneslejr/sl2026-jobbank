# Data Processing Scripts

This directory contains the production script for fetching job data from the CampOS API.

## fetch-job-export.js

## Running with Docker (Recommended for Servers)

**Requirements**:
- Docker

**Setup**:
```bash
# 1. Create config file from template
cp scripts/config.example.json scripts/config.json

# 2. Edit config.json and add your API keys
# (File is git-ignored for security)
```

**Usage**:
```bash
# Run the export script with Docker
./scripts/run-export.sh /path/to/output/directory

# Example: Export to website public directory
./scripts/run-export.sh /var/www/html/jobbank/public

# Example: Export to local directory
./scripts/run-export.sh ./public
```

The Docker approach:
- Requires no Node.js installation on the server
- Creates an isolated environment
- Can be run from any directory
- Automatically creates the output directory if it doesn't exist
- Writes `jobs-export.json` to the specified directory

---

## Running with Node.js (Development)

**Requirements**:
- Node.js 22+ (already required to build the app)

**Setup**:
```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Create config file from template
cp scripts/config.example.json scripts/config.json

# 3. Edit config.json and add your API keys
# (File is git-ignored for security)
```

**Usage**:
```bash
node scripts/fetch-job-export.js
# or
npm run fetch-export
```

**What it does**:
1. Fetches organizations from CampOS API
2. Fetches jobs from CampOS API
3. Joins jobs with organizational hierarchy (område/udvalg/team/arbejdsgruppe)
4. Applies organization name overrides from `src/config/org-overrides.js`
5. Formats dates to Danish format (DD-MM-YYYY)
6. Outputs to `public/jobs-export.json`
7. Generates per-job OG HTML pages in `public/job/` (when `public/index.html` exists)

**Scheduling**: Run on a cron schedule to keep data fresh (see Cron Job Setup below).

**Output Format**:
```json
{
  "id": 31,
  "name": "Job Title",
  "teaser": "Short description",
  "description": "Full description",
  "description_time_and_scope": "Time and scope details",
  "requirements": "Special requirements or null",
  "application_count": 9,
  "no_of_recruitment": 20,
  "no_of_hired_employee": 9,
  "min_age": 18,
  "website_url": "/jobs/detail/31",
  "create_date": "2025-05-06T23:59:57.525504+02:00",
  "formatted_create_date": "06-05-2025",
  "org_hierarchy": {
    "area": "Lejrplads & Lejrliv (LEJ)",
    "area_full": "5500 - Lejrplads & Lejrliv (LEJ)",
    "committee": "Handel, mad & Indkøb",
    "committee_full": "5590 - Handel, mad & Indkøb",
    "team": "Voksenområde",
    "team_full": "5598 - Voksenområde",
    "workgroup": "Bar 2",
    "workgroup_full": "55982 - Bar 2"
  }
}
```

---

## Configuration Files

### config.json (git-ignored)
Contains sensitive API keys. Created from `config.example.json`.

Structure:
```json
{
  "job_export_url": "https://tilmelding.spejderneslejr.dk/exports/6?api_key=YOUR_KEY",
  "org_export_url": "https://tilmelding.spejderneslejr.dk/exports/9?api_key=YOUR_KEY"
}
```

### config.example.json
Template for creating `config.json`. Committed to git.

---

## Organization Name Overrides

Organization name overrides are defined in `src/config/org-overrides.js` and imported directly by the script — no duplication required.

---

## Cron Job Setup

### With Docker (Recommended)

To run the export automatically on a schedule using Docker:

```bash
# Edit crontab
crontab -e

# Add entry to run daily at 3 AM
0 3 * * * /path/to/sl2026-jobbank/scripts/run-export.sh /var/www/html/jobbank/public >> /var/log/job-export.log 2>&1

# Or run every 6 hours
0 */6 * * * /path/to/sl2026-jobbank/scripts/run-export.sh /var/www/html/jobbank/public >> /var/log/job-export.log 2>&1
```

**Important**: Use absolute paths in cron jobs!

### With Node.js

To run the Node.js script directly on a schedule:

```bash
# Edit crontab
crontab -e

# Add entry to run daily at 3 AM
0 3 * * * cd /path/to/sl2026-jobbank && node scripts/fetch-job-export.js >> logs/job-export.log 2>&1

# Or run every 6 hours
0 */6 * * * cd /path/to/sl2026-jobbank && node scripts/fetch-job-export.js >> logs/job-export.log 2>&1
```

Create the logs directory:
```bash
mkdir -p logs
```

## Troubleshooting

**"Configuration file not found"**:
```bash
# Create config.json from template
cp scripts/config.example.json scripts/config.json
# Then edit config.json to add your API keys
```

**"HTTP Error 401" or "403 Forbidden"**:
- API keys are invalid or expired
- Check with CampOS admin for new keys
- Verify URLs are correct in config.json

**"Organization hierarchy shows 'Unknown'"**:
- Organization might be missing from org export
- Check that organization names match exactly between job and org exports
- Verify parent_path format in org export

**"Date formatting fails"**:
- Ensure API returns dates in ISO 8601 format
- Check the date string format in the API response
