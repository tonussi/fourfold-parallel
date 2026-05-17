#!/bin/bash
set -e

# Run this project (bible-api now runs as its own Docker Compose service)

cd /app

# Cloud Run sets NODE_ENV=production by default, which breaks Vite's dev server Fast Refresh

export NODE_ENV=development

npm run dev -- --host
