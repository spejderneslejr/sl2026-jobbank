# Deployment

The site is deployed as static files served by a Caddy container behind Traefik.

## Server setup

Server-side directory layout:

```
/home/hostroot/sites/danquah/sljob/
  docker-compose.yml
  Caddyfile
  htdocs/                # mounted into Caddy container as /srv
    index.html
    assets/
    logos/
    jobs-export.json     # managed by existing cron (not touched by deploys)
    version.json         # written by deploy script
```

Copy `docker-compose.yml` and `Caddyfile` to the server and start the container:

```bash
docker-compose up -d
```

## Automated deployment

Pushes to `main` trigger a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Builds the project
2. Writes `version.json` with the git SHA, tags, and timestamp
3. Rsyncs `dist/` to the server (preserving `jobs-export.json`)

### Required GitHub secrets

| Secret | Description |
|--------|-------------|
| `DEPLOY_SSH_KEY` | Private SSH key for the deploy user |
| `DEPLOY_HOST` | Server hostname |
| `DEPLOY_USER` | SSH username on the server |
| `DEPLOY_PATH` | Destination path on the server |

For the beta environment, the same secrets are used with a `_BETA` suffix: `DEPLOY_SSH_KEY_BETA`, `DEPLOY_HOST_BETA`, `DEPLOY_USER_BETA`, `DEPLOY_PATH_BETA`.

## Manual deployment

```bash
DEPLOY_HOST=example.com DEPLOY_USER=deploy bash deploy/deploy.sh
```

The script runs `npm ci && npm run build`, then rsyncs `dist/` to the server. It uses `--exclude='jobs-export.json'` so the cron-managed export is never overwritten.

## Version info

Each deploy writes a `version.json` to the site root:

```json
{"sha": "a832e2f...", "short_sha": "a832e2f", "tags": ["v1.0.0"], "deployed_at": "2026-02-15T21:50:00Z"}
```

Access it at `https://jobs.spejderneslejr.dk/version.json`.

## Files

| File | Description |
|------|-------------|
| `Caddyfile` | Caddy config — serves from `/srv` on `:80` with SPA fallback |
| `docker-compose.yml` | Caddy Alpine container with Traefik v1 labels |
| `deploy.sh` | Build & rsync deploy script (used locally and by CI) |
