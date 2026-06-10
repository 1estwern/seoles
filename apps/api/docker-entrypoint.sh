#!/bin/sh
set -e
echo "Running migrations..."
npx prisma migrate deploy
echo "Seeding admin (idempotent)..."
npx prisma db seed || true
echo "Starting API..."
exec node dist/main.js
