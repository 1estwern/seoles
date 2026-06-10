#!/bin/bash
# На сервере в VNC (root), после загрузки seoles-deploy.tar.gz в /opt/
set -euo pipefail

ARCHIVE="/opt/seoles-deploy.tar.gz"
INSTALL_DIR="/opt/seoles"

echo "=== SEOLES install via VNC ==="

if [ ! -f "$ARCHIVE" ]; then
  echo "ERROR: Upload $ARCHIVE via Beget File Manager first."
  exit 1
fi

apt-get update -y
apt-get install -y curl ca-certificates

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
apt-get install -y docker-compose-plugin 2>/dev/null || true

mkdir -p /opt
tar xzf "$ARCHIVE" -C /opt
cd "$INSTALL_DIR"

if [ ! -f .env ]; then
  chmod +x infra/scripts/generate-env.sh
  ./infra/scripts/generate-env.sh | tee .env
  echo ""
  echo ">>> SAVE admin password from line above <<<"
fi

docker compose --profile with-nginx up -d --build

echo ""
echo "=== Check locally on server ==="
sleep 15
curl -s http://127.0.0.1/api/health || curl -s http://localhost/api/health || true
echo ""
echo "If health OK here but not from Mac — Beget network firewall blocks 80/443/22"
echo "Open: Beget panel -> SEOLES -> Настройки сети"
