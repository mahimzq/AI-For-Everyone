#!/usr/bin/env bash
# Production deploy helper: pull latest code, install deps, reload PM2 zero-downtime.
set -euo pipefail

export PATH="$PATH"

REPO_DIR="${REPO_DIR:-$HOME/domains/aiforeveryone.mindsetai.co.uk/ai-for-everybody}"
APP_DIR="$REPO_DIR/server"
PM2_BIN="${PM2_BIN:-$APP_DIR/node_modules/.bin/pm2}"

cd "$REPO_DIR"
echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing server dependencies"
cd "$APP_DIR"
npm ci --omit=dev

echo "==> Reloading PM2 (zero downtime)"
cd "$REPO_DIR"
"$PM2_BIN" reload ecosystem.config.js --env production

echo "==> Current PM2 status"
"$PM2_BIN" status mindsetai-api

echo "Deployment complete."
