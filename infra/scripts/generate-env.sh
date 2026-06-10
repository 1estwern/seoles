#!/bin/bash
# Print production .env (no secrets stored). Usage: ./infra/scripts/generate-env.sh > .env
set -euo pipefail

JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 16)}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 14 | tr -d '/+=' | head -c 16)}"

cat <<EOF
DOMAIN=
SERVER_PUBLIC_URL=http://2.56.240.192

POSTGRES_USER=crm
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=crm
DATABASE_URL=postgresql://crm:${POSTGRES_PASSWORD}@postgres:5432/crm

API_PORT=3001
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
CORS_ORIGIN=http://2.56.240.192

ADMIN_EMAIL=admin@seoles.local
ADMIN_PASSWORD=${ADMIN_PASSWORD}

MAKE_WEBHOOK_URL=

LLM_PROVIDER=claude
LLM_API_KEY=
LLM_MODEL=

NEXT_PUBLIC_API_URL=/api
HTTP_PORT=80
HTTPS_PORT=443
EOF

echo "# Admin login: admin@seoles.local / ${ADMIN_PASSWORD}" >&2
