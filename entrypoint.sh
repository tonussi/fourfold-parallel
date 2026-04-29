#!/bin/bash
set -e

# Run this project (bible-api now runs as its own Docker Compose service)
cd /app
npm run dev -- --host
