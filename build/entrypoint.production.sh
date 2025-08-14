#!/bin/sh

echo "Seed Database Production"
npm run seed:prod

echo "Generate Database"
npx prisma generate

echo "Migration Database"
npx prisma migrate deploy

echo "Start Server Prod"
npm run start:prod