#!/bin/bash
set -e
cd /opt
tar xzf seoles-deploy.tar.gz
cd seoles
chmod +x infra/scripts/*.sh
apt-get update -y
apt-get install -y curl ca-certificates
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin 2>/dev/null || true
test -f .env || ./infra/scripts/generate-env.sh | tee .env
docker compose --profile with-nginx up -d --build
sleep 20
curl -s http://127.0.0.1/api/health || true
echo DONE
