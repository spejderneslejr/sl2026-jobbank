# Jobbank for Spejdernes Lejr 2026

A Vue 3 + Vite application for browsing and applying to volunteer positions for the 2026 Danish Scout Camp.

## Project Structure

```
sl2026-jobbank/
├── public/.                      # Static assets included in build
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

The application loads job data from `/public/jobs-export.json`. This file is generated from an Excel export using the conversion script in the parent directory.

To update job data:

1. Place new Excel export in `/references/job-export/`
2. Run the conversion script:
```bash
python3 ../convert_jobs.py
```
3. Copy the generated JSON to public/:
```bash
cp ../references/jobs/jobs-export.json public/
```
4. Rebuild and deploy

## Deployment

This is a static site that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

Simply build the project and deploy the `dist/` directory.

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
