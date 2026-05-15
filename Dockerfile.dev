FROM node:22-bookworm-slim

# Install git and build tools required for native dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 3000

RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
