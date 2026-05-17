FROM node:22-bookworm-slim

# Install git for native dependencies

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies

COPY package*.json ./
RUN npm ci

# Copy source and build the production bundle

COPY . .

RUN npm run build

# Install a static web server

RUN npm install -g serve

EXPOSE 3000

# Serve the static 'dist' directory on port 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
