#!/bin/bash
set -e

# Cloud Run sets the PORT environment variable. Default to 8080 for Nginx.
if [ -f "/etc/nginx/sites-available/default.template" ]; then
    NGINX_PORT=${PORT:-8080}
    echo "Configuring Nginx to listen on port $NGINX_PORT"
    # Replace ${PORT} in the nginx template and save to the default location
    export PORT=$NGINX_PORT
    envsubst '${PORT}' < /etc/nginx/sites-available/default.template > /etc/nginx/sites-available/default
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
fi
# Start Redis in the background
echo "Starting Redis server..."
redis-server --daemonize yes

# Start Bible API in the background if the directory exists
if [ -d "/bible-api" ]; then
    echo "Starting Bible API on internal port 3001..."
    cd /bible-api
    # Ensure Bible API uses its own port, not the one Cloud Run assigned to the container
    PORT=3001 npm start &
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
