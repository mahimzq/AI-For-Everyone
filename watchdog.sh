#!/usr/bin/env bash
# Simple health watchdog: if /api/health fails N times, restart PM2 app.

set -u

export PATH="$PATH"

API_URL="https://aiforeveryone.mindsetai.co.uk/api/health"
LOCKFILE="/tmp/mindsetai_restart_lock"
FAILCOUNT_FILE="/tmp/mindsetai_failcount"
PM2_APP="mindsetai-api"
PM2_BIN="${PM2_BIN:-$HOME/domains/aiforeveryone.mindsetai.co.uk/server/node_modules/.bin/pm2}"
LOG="$HOME/watchdog.log"

MAX_FAILS=3
TIMEOUT=15
COOLDOWN=300 # seconds

failcount=0
[ -f "$FAILCOUNT_FILE" ] && failcount=$(cat "$FAILCOUNT_FILE" 2>/dev/null || echo 0)

if curl -fsS --max-time "$TIMEOUT" "$API_URL" >/dev/null; then
    echo "$(date): API healthy" >> "$LOG"
    echo 0 > "$FAILCOUNT_FILE"
    tail -200 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG" 2>/dev/null
    exit 0
fi

failcount=$((failcount + 1))
echo "$failcount" > "$FAILCOUNT_FILE"
echo "$(date): Health check failed ($failcount/$MAX_FAILS)" >> "$LOG"

if [ "$failcount" -lt "$MAX_FAILS" ]; then
    exit 0
fi

if [ -f "$LOCKFILE" ]; then
    echo "$(date): Restart skipped (cooldown active)" >> "$LOG"
    exit 0
fi

echo "$(date): API unhealthy for $MAX_FAILS checks. Restarting $PM2_APP..." >> "$LOG"
touch "$LOCKFILE"
"$PM2_BIN" restart "$PM2_APP" >> "$LOG" 2>&1 || echo "$(date): pm2 restart failed" >> "$LOG"

(sleep "$COOLDOWN" && rm -f "$LOCKFILE" && echo 0 > "$FAILCOUNT_FILE") &

exit 0
