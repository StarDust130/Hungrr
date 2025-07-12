#!/usr/bin/env bash

# Exit on error
set -o errexit

# Install ALL dependencies (not just production)
npm install

# Generate Prisma client (optional, safe even if not used)
npx prisma generate

# Build TypeScript
npm run build
