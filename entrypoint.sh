#!/bin/bash
set -e

# Start Bible API in the background if the directory exists
if [ -d "/bible-api" ]; then
    echo "Starting Bible API..."
    cd /bible-api
    npm start &
fi

# Start application (Nginx for prod, npm run dev for dev)
if command -v nginx > /dev/null && [ -f /etc/nginx/sites-available/default ]; then
    echo "Starting Nginx..."
    nginx -g "daemon off;"
else
    echo "Starting Main Application (Dev Mode)..."
    cd /app
    npm run dev -- --host
fi
