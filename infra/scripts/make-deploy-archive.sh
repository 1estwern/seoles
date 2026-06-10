#!/bin/bash
# Запуск на Mac: создаёт архив для загрузки через Файловый менеджер Beget
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${ROOT}/seoles-deploy.tar.gz"
cd "$(dirname "$ROOT")"
tar czf "$OUT" \
  --exclude='seoles/node_modules' \
  --exclude='seoles/apps/web/.next' \
  --exclude='seoles/apps/api/dist' \
  --exclude='seoles/.git' \
  --exclude='seoles/.env' \
  --exclude='seoles/seoles-deploy.tar.gz' \
  seoles
echo "Created: $OUT"
echo "Upload to server /opt/ via Beget File Manager, then in VNC run:"
echo "  bash /opt/seoles/infra/scripts/vnc-install-from-archive.sh"
