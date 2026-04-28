#!/bin/bash
set -e

# Build and run bible-api on port 3000
if [ ! -f "/app/bible-api/package.json" ]; then
    git clone https://github.com/undergroundchurch/bible-api.git /app/bible-api
fi

cd /app/bible-api
npm ci
PORT=3001 nohup npm start > /tmp/bible-api.log 2>&1 &
sleep 3

# Run this project
cd /app
npm run dev -- --host