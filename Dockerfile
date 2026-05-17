FROM node:22-bookworm-slim

# Install git for native dependencies

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies

COPY package*.json ./
RUN npm ci

# Copy source and build the production bundle

COPY . .

# Declare build-time arguments with default values from .env
ARG VITE_BIBLE_API_URL=https://bible-api-428654190711.europe-north2.run.app
ARG VITE_BIBLE_API_PORT=""
ARG VITE_BIBLE_API_INTERNAL_URL=https://bible-api-428654190711.europe-north2.run.app
ARG VITE_STATS_API_URL=https://bible-api-428654190711.europe-north2.run.app
ARG VITE_STATS_API_PORT=3000
ARG VITE_STATS_API_INTERNAL_URL=https://bible-api-428654190711.europe-north2.run.app
ARG REDIS_PORT=6390
ARG ALLOWED_HOST=fourfold-parallel-428654190711.europe-north2.run.app
ARG NODE_ENV=production

# Set environment variables so they are available to Vite during build
ENV VITE_BIBLE_API_URL=$VITE_BIBLE_API_URL
ENV VITE_BIBLE_API_PORT=$VITE_BIBLE_API_PORT
ENV VITE_BIBLE_API_INTERNAL_URL=$VITE_BIBLE_API_INTERNAL_URL
ENV VITE_STATS_API_URL=$VITE_STATS_API_URL
ENV VITE_STATS_API_PORT=$VITE_STATS_API_PORT
ENV VITE_STATS_API_INTERNAL_URL=$VITE_STATS_API_INTERNAL_URL
ENV REDIS_PORT=$REDIS_PORT
ENV ALLOWED_HOST=$ALLOWED_HOST
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# Install a static web server

RUN npm install -g serve

EXPOSE 3000

# Serve the static 'dist' directory on port 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
