#!/bin/bash
set -euo pipefail

ROOT="${1:-/opt/seoles}"
cd "$ROOT"

API_PKG="apps/api/package.json"
API_DF="apps/api/Dockerfile"
WEB_DF="apps/web/Dockerfile"

if [ ! -f "$API_PKG" ]; then
  echo "ERROR: $ROOT/$API_PKG not found"
  find "$ROOT" -maxdepth 4 -name package.json
  exit 1
fi

echo "=== Fix Dockerfile (no apk, use Debian slim) ==="
cat > "$API_DF" << 'EOF'
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate && npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/docker-entrypoint.sh"]
EOF

if [ -f "$WEB_DF" ]; then
  sed -i 's/node:22-alpine/node:22-slim/g' "$WEB_DF" || true
fi

echo "=== bcrypt -> bcryptjs ==="
sed -i 's/"bcrypt": "[^"]*"/"bcryptjs": "^2.4.3"/' "$API_PKG"
sed -i 's/@types\/bcrypt/@types\/bcryptjs/g' "$API_PKG" || true
grep -q bcryptjs "$API_PKG" || sed -i 's/"@prisma\/client"/"bcryptjs": "^2.4.3",\n    "@prisma\/client"/' "$API_PKG"

for f in apps/api/src/auth/auth.service.ts apps/api/src/users/users.service.ts apps/api/prisma/seed.ts; do
  [ -f "$f" ] && sed -i "s/from 'bcrypt'/from 'bcryptjs'/g" "$f"
done

echo "=== Build ==="
docker compose --profile with-nginx build --no-cache
docker compose --profile with-nginx up -d

sleep 20
curl -s http://127.0.0.1/api/health || true
echo ""
grep ADMIN_PASSWORD .env 2>/dev/null || true
echo DONE
