#!/usr/bin/env bash
set -euo pipefail

# ── Konfigūracija ────────────────────────────────────────────────────────────
SERVER="admin_virgis@172.16.16.19"       # <-- pakeisk
DEPLOY_DIR="/app/digitransit-ui-lt"
# ─────────────────────────────────────────────────────────────────────────────

echo "==> Archyvuojama ir siunčiama į $SERVER:$DEPLOY_DIR ..."
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='_static' \
    --exclude='.yarn/cache' \
    --exclude='Screenshot*.png' \
    -czf /tmp/digitransit-ui-lt.tar.gz .

scp /tmp/digitransit-ui-lt.tar.gz "$SERVER:/tmp/"
rm /tmp/digitransit-ui-lt.tar.gz

ssh "$SERVER" "mkdir -p $DEPLOY_DIR && tar -xzf /tmp/digitransit-ui-lt.tar.gz -C $DEPLOY_DIR && rm /tmp/digitransit-ui-lt.tar.gz"

echo "==> Build + up ant serverio ..."
ssh "$SERVER" bash -s << 'EOF'
set -euo pipefail
cd /app/digitransit-ui-lt

echo "--- docker compose build ---"
docker compose build

echo "--- docker compose up -d ---"
docker compose up -d

echo "--- Statusas ---"
docker compose ps
EOF

echo "==> Atlikta."
