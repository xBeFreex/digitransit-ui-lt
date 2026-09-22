#!/usr/bin/env bash
set -euo pipefail

# ── Konfigūracija ────────────────────────────────────────────────────────────
SERVER="admin_virgis@172.16.16.19"       # <-- pakeisk
DEPLOY_DIR="/app/digitransit-ui-lt"
# ─────────────────────────────────────────────────────────────────────────────

echo "==> Siunčiama docker-compose.yml į $SERVER:$DEPLOY_DIR ..."
ssh "$SERVER" "mkdir -p $DEPLOY_DIR"
scp docker-compose.yml "$SERVER:$DEPLOY_DIR/docker-compose.yml"

echo "==> Pull + up ant serverio (image iš GHCR) ..."
ssh "$SERVER" bash -s << EOF
set -euo pipefail
cd "$DEPLOY_DIR"

echo "--- docker compose pull ---"
docker compose pull

echo "--- docker compose up -d ---"
docker compose up -d

echo "--- Statusas ---"
docker compose ps
EOF

echo "==> Atlikta."
