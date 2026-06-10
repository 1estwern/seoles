#!/bin/bash
# На Mac: создаёт файл с командами для VNC (если curl/file.io не работают)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ARCHIVE="$ROOT/seoles-deploy.tar.gz"
OUT="$ROOT/VNC-PASTE-COMMANDS.txt"

bash "$ROOT/infra/scripts/make-deploy-archive.sh" >/dev/null

{
  echo "# 1) В VNC выполните:"
  echo "mkdir -p /opt && cd /opt"
  echo ""
  echo "# 2) Создайте файл (кнопка Clipboard в VNC — вставьте ВЕСЬ блок base64 между маркерами):"
  echo "cat > /opt/archive.b64 << 'B64END'"
  base64 < "$ARCHIVE"
  echo "B64END"
  echo ""
  echo "# 3) Распакуйте и установите:"
  cat << 'SCRIPT'
base64 -d /opt/archive.b64 > /opt/seoles-deploy.tar.gz
cd /opt && tar xzf seoles-deploy.tar.gz
cd /opt/seoles
apt-get update -y && apt-get install -y curl ca-certificates
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin 2>/dev/null || true
chmod +x infra/scripts/*.sh install-on-server.sh 2>/dev/null || true
test -f .env || ./infra/scripts/generate-env.sh | tee .env
docker compose --profile with-nginx up -d --build
sleep 25
curl -s http://127.0.0.1/api/health
SCRIPT
} > "$OUT"

LINES=$(wc -l < "$OUT" | tr -d ' ')
SIZE=$(wc -c < "$OUT" | tr -d ' ')
echo "Created: $OUT ($SIZE bytes, $LINES lines)"
echo "Open in TextEdit, copy sections into VNC Clipboard one at a time."
