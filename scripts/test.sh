#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.test.yml"

docker compose -f "$COMPOSE_FILE" up -d

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v
}
trap cleanup EXIT

echo "Waiting for postgres to be ready..."
until docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U formiq >/dev/null 2>&1; do
  sleep 1
done

export DATABASE_URL="postgresql://formiq:formiq@localhost:5433/formiq_test?schema=public"

echo "Applying migrations..."
npx prisma migrate deploy --config packages/platform/prisma.config.ts

echo "Running Nx tests..."
npx nx test platform
