#!/bin/sh

echo "Generate Database"
npx prisma generate

echo "Push Database"
npx prisma db push

echo "Seed Database"
npx prisma db seed

echo "Start Server Dev"
npm run start:dev