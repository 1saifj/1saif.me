#!/bin/bash

# Preview script for local testing
# Temporarily moves Cloudflare-specific files that interfere with Vite preview server

echo "🚀 Starting local preview..."

# Move Cloudflare-specific files temporarily
if [ -f "_redirects" ]; then
    mv _redirects _redirects.cloudflare
    echo "📁 Moved _redirects to _redirects.cloudflare"
fi

if [ -f "_headers" ]; then
    mv _headers _headers.cloudflare
    echo "📁 Moved _headers to _headers.cloudflare"
fi

# Start preview server
echo "🌐 Starting preview server on http://localhost:4173/"
npm run preview

# Cleanup function to restore files on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [ -f "_redirects.cloudflare" ]; then
        mv _redirects.cloudflare _redirects
        echo "📁 Restored _redirects"
    fi
    
    if [ -f "_headers.cloudflare" ]; then
        mv _headers.cloudflare _headers
        echo "📁 Restored _headers"
    fi
    echo "✅ Cleanup complete"
}

# Set trap to run cleanup on script exit
trap cleanup EXIT 