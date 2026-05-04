#!/bin/bash
set -e

# Start Bible API in the background
echo "Starting Bible API..."
cd /bible-api
npm start &

# Start main application
echo "Starting Main Application..."
cd /app
npm run dev -- --host
