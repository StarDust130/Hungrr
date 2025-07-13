#!/usr/bin/env bash

# Exit if any command fails
set -o errexit

# Install deps
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript project
npm run build
s