#!/bin/sh

echo "Waiting for PostgreSQL to start..."
sleep 5

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Starting Next.js application..."
node server.js