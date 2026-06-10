#!/bin/bash
# Run on the server as root or with sudo (Step 0)
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  apt-get install -y docker-compose-plugin
fi

ufw --force enable || true
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload || true

mkdir -p /opt/seoles
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" /opt/seoles 2>/dev/null || true

echo "Done. Deploy code to /opt/seoles and run: docker compose --profile with-nginx up -d --build"
