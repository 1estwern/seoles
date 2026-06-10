#!/bin/bash
# Local: sync repo to server and start stack
set -euo pipefail

HOST="${1:?Usage: ./infra/scripts/deploy.sh user@host}"
REMOTE_DIR="${REMOTE_DIR:-/opt/seoles}"

if [ -n "${SSHPASS:-}" ] && command -v sshpass >/dev/null 2>&1; then
  export RSYNC_RSH="sshpass -e ssh -o StrictHostKeyChecking=accept-new"
  SSH=(sshpass -e ssh -o StrictHostKeyChecking=accept-new)
else
  SSH=(ssh)
fi

rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude dist \
  --exclude .env \
  --exclude .git \
  ./ "${HOST}:${REMOTE_DIR}/"

"${SSH[@]}" "${HOST}" "cd ${REMOTE_DIR} && test -f .env || cp .env.example .env && docker compose --profile with-nginx up -d --build"

echo "Deployed to ${HOST}:${REMOTE_DIR}"
