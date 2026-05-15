# Stage 1: Build the React application
FROM node:22-bookworm-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Final production image
FROM node:22-bookworm-slim

# Install git and nginx (plus gettext-base for envsubst)
RUN apt-get update && apt-get install -y git nginx redis-server gettext-base python3 make g++ && rm -rf /var/lib/apt/lists/*

# Setup Bible API
WORKDIR /bible-api
RUN git clone https://github.com/undergroundchurch/bible-api.git .
RUN git checkout dev
RUN npm rebuild
RUN npm install
RUN node CreateUsers.js
RUN echo "PORT=3001\nREDIS_HOST=localhost\nREDIS_PORT=6379" > .env

# Setup Nginx to serve the build
WORKDIR /app
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy nginx config as a template for envsubst
COPY nginx.conf /etc/nginx/sites-available/default.template

# Environment variables for Bible API
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
# If a real Redis is available, override REDIS_HOST via docker run -e

# Expose ports (Cloud Run uses PORT env, but we list them for clarity)
EXPOSE 3000

# Copy and setup entrypoint
COPY entrypoint.prod.sh .
RUN chmod +x entrypoint.prod.sh

CMD ["./entrypoint.prod.sh"]
