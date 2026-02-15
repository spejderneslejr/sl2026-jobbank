#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:?DEPLOY_HOST is required}"
DEPLOY_USER="${DEPLOY_USER:?DEPLOY_USER is required}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/hostroot/sites/danquah/sljob/htdocs/}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building project..."
cd "$PROJECT_DIR"
npm ci
npm run build

echo "Writing version.json..."
SHA="$(git rev-parse HEAD)"
SHORT_SHA="$(git rev-parse --short HEAD)"
TAGS="$(git tag --points-at HEAD 2>/dev/null | sed 's/.*/"&"/' | paste -sd, - || echo "")"
TAGS="[${TAGS}]"
printf '{"sha":"%s","short_sha":"%s","tags":%s,"deployed_at":"%s"}\n' \
  "$SHA" "$SHORT_SHA" "$TAGS" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  > "$PROJECT_DIR/dist/version.json"

echo "Deploying to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
rsync -avz --delete \
  --exclude='jobs-export.json' \
  "$PROJECT_DIR/dist/" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

echo "Deploy complete."
