#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Running database seed..."
npx prisma db seed

echo "Starting server..."
exec node dist/index.js
