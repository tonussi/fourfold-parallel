#!/bin/bash
set -e

# Start Bible API in the background
echo "Starting Bible API..."
cd /bible-api
npm start &

# Start Nginx in the foreground
echo "Starting Nginx..."
nginx -g "daemon off;"
