#!/bin/bash
# ══════════════════════════════════════════════
# ZERO-DOWNTIME DEPLOYMENT SCRIPT
# Fetches updates, builds, and reloads PM2 gracefully
# ══════════════════════════════════════════════

echo "🚀 Starting Deployment..."

# Ensure we're in the right directory
APP_DIR="/var/www/ai4you.mindsetai.cloud"
cd "$APP_DIR" || exit

echo "📥 Pulling latest code..."
git fetch --all
git reset --hard origin/main
git pull origin main

echo "📦 Installing Server Dependencies..."
cd "$APP_DIR/server" || exit
npm ci --production --ignore-scripts

    echo "📦 Installing Client Dependencies & Building..."
    cd "$APP_DIR/client" || exit
    npm ci --ignore-scripts
    npm run build

    echo "🚚 Syncing Build to Public HTML..."
    cp -r dist/* "$APP_DIR/public_html/"

echo "🔄 Reloading PM2 (Zero-Downtime)..."
cd "$APP_DIR" || exit
# pm2 reload restarts processes one-by-one, keeping the app online
NODE_ENV=production pm2 reload ecosystem.config.js --env production

echo "🧹 Clean up PM2 logs (optional)..."
pm2 flush ai-for-everybody

echo "✅ Deployment Complete! The site is now live with zero downtime."
