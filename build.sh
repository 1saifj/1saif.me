#!/bin/bash

# Cloudflare Pages Build Script
# This script ensures npm is used instead of yarn

echo "🚀 Starting Cloudflare Pages build..."

# Remove any yarn.lock file
rm -f yarn.lock

# Ensure we're using npm
echo "📦 Using npm for package management..."

# Install dependencies with npm
npm install --legacy-peer-deps --no-audit --no-fund

# Update browserslist database to avoid warnings
echo "🔄 Updating browserslist database..."
npx update-browserslist-db@latest || echo "⚠️ Browserslist update failed, continuing..."

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!" 