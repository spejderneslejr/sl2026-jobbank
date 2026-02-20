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

### Running Tests

```bash
npm test
```

Tests use [Vitest](https://vitest.dev/) and run without a browser or dev server. Currently covers:
- Router redirect rules (`src/router/index.test.js`)
- URL cleanup after redirect processing (`src/App.cleanupUrl.test.js`) — verifies that legacy URLs like `/?search=brandmand` or `/detail/slug-409` are replaced with their canonical forms (`/`, `/detail/409`) via `router.replace()` so they don't appear in browser history.

## Data Management

Job data is loaded from `/jobs-export.json` at runtime. This file is managed by a server-side cron job that exports from Odoo and is **not** part of the deployment — it lives on the server independently.

To update job data manually, see the export scripts in `scripts/`.

## Deployment

Pushes to `main` auto-deploy via GitHub Actions. See [`deploy/README.md`](deploy/README.md) for full details on server setup, secrets, and manual deployment.

## License

For Spejdernes Lejr 2026
