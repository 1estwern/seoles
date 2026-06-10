#!/bin/bash
# На Mac в Terminal — загрузит файлы и выдаст команды для VNC
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ARCHIVE="$ROOT/seoles-deploy.tar.gz"
INSTALL="$ROOT/install-on-server.sh"

bash "$ROOT/infra/scripts/make-deploy-archive.sh" >/dev/null

echo "Загрузка на transfer.sh ..."
ARCH_URL=$(curl --silent --upload-file "$ARCHIVE" "https://transfer.sh/seoles-deploy.tar.gz")
INST_URL=$(curl --silent --upload-file "$INSTALL" "https://transfer.sh/install-on-server.sh")

echo ""
echo "========== КОМАНДЫ ДЛЯ VNC (по одной строке) =========="
echo ""
echo "mkdir -p /opt"
echo "curl -fsSL \"$ARCH_URL\" -o /opt/seoles-deploy.tar.gz"
echo "curl -fsSL \"$INST_URL\" -o /opt/install-on-server.sh"
echo "chmod +x /opt/install-on-server.sh"
echo "bash /opt/install-on-server.sh"
echo ""
echo "Ссылки действуют ~14 дней."
