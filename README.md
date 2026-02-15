# Jobbank for Spejdernes Lejr 2026

A Vue 3 + Vite application for browsing and applying to volunteer positions for the 2026 Danish Scout Camp.

## Project Structure

```
sl2026-jobbank/
├── .github/workflows/deploy.yml  # GitHub Actions deploy workflow
├── deploy/
│   ├── Caddyfile                 # Caddy server config
│   ├── docker-compose.yml        # Container setup for production
│   └── deploy.sh                 # Build & deploy script
├── scripts/                      # Data export scripts
├── public/                       # Static assets included in build
├── src/
│   ├── components/
│   │   ├── Layout.vue            # Page layout wrapper
│   │   ├── JobCard.vue           # Individual job card
│   │   ├── JobList.vue           # Grid of job cards
│   │   ├── JobModal.vue          # Job details modal
│   │   └── JobFilter.vue         # Search and filter controls
│   ├── App.vue                   # Main application component
│   ├── main.js                   # Application entry point
│   └── style.css                 # Global styles
├── index.html                    # HTML template
├── package.json                  # Dependencies
└── vite.config.js                # Vite configuration
```

### Prerequisites

- Node.js 22.x or higher (use nvm: `nvm use 22`)
- npm 10.x or higher

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Data Management

Job data is loaded from `/jobs-export.json` at runtime. This file is managed by a server-side cron job that exports from Odoo and is **not** part of the deployment — it lives on the server independently.

To update job data manually, see the export scripts in `scripts/`.

## Deployment

The site is deployed as static files served by a Caddy container behind Traefik.

### Server setup

The `deploy/` directory contains the server-side configuration:

- `docker-compose.yml` — Caddy Alpine container with Traefik labels
- `Caddyfile` — Static file server with SPA fallback

On the server:
```bash
mkdir -p ~/sl2026/jobbank/htdocs
cd ~/sl2026/jobbank
# Place docker-compose.yml and Caddyfile here
docker-compose up -d
```

### Automated deployment

Pushes to `main` trigger a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Builds the project
2. Writes `version.json` with the git SHA, tags, and timestamp
3. Rsyncs `dist/` to the server (preserving `jobs-export.json`)

Required GitHub secrets: `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`.

### Manual deployment

```bash
DEPLOY_HOST=example.com DEPLOY_USER=deploy bash deploy/deploy.sh
```

### Version info

Each deploy writes a `version.json` to the site root:
```json
{"sha": "a832e2f...", "short_sha": "a832e2f", "tags": ["v1.0.0"], "deployed_at": "2026-02-15T21:50:00Z"}
```
Access it at `https://jobs.spejderneslejr.dk/version.json`.

## Features Implemented

### Job Display
- Grid layout of job cards with hover effects
- Show job title, area, teaser, and recruitment progress
- Click to open detailed modal

### Search & Filter
- Real-time search across job titles, descriptions, and areas
- Filter by organizational area
- Display result count

### Job Details Modal
- Full job information including:
  - Job title and area
  - Teaser and description
  - Time and scope commitment
  - Special requirements (if any)
  - Recruitment progress bar
  - Apply button linking to CampOS
- Deep linking support (URL hash with job ID)
- Prevent body scroll when modal is open

### Mobile Responsive
- Mobile-first design
- Optimized layouts for phones, tablets, and desktop
- Touch-friendly interfaces

## Browser Support

Modern browsers that support ES2015+:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

For Spejdernes Lejr 2026
