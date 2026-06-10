#!/bin/bash
# Вставьте в VNC-терминал Beget (cp.beget.com → SEOLES → Терминал → VNC)
# После входа как root. Открывает SSH + порты 80/443 и ставит Docker.

set -euo pipefail

echo "=== 1. SSH service ==="
systemctl enable ssh 2>/dev/null || systemctl enable sshd 2>/dev/null || true
systemctl restart ssh 2>/dev/null || systemctl restart sshd 2>/dev/null || true
systemctl status ssh 2>/dev/null || systemctl status sshd 2>/dev/null || true

echo "=== 2. Firewall (ufw) ==="
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force disable || true
  echo "ufw disabled for now (enable later with rules above)"
fi

echo "=== 3. Listen ports ==="
ss -tlnp | grep -E ':22|:80|:443' || netstat -tlnp 2>/dev/null | grep -E ':22|:80|:443' || true

echo "=== 4. Docker ==="
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
docker --version || true
docker compose version || apt-get install -y docker-compose-plugin

mkdir -p /opt/seoles
echo "=== Done. Try from Mac: ssh root@2.56.240.192 ==="
