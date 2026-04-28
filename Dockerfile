FROM node:22-bullseye-slim

# Install git and build tools required for native dependencies
RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
 
# Clone bible-api via SSH
RUN git clone https://github.com/undergroundchurch/bible-api.git .

# Install dependencies
RUN npm ci

EXPOSE 3000

CMD ["npm", "start"]
