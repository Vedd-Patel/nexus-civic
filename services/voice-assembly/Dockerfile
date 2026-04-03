FROM node:20-bullseye-slim

# Install system dependencies including those needed for canvas/node-s2
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable corepack for yarn/pnpm if needed, but we use npm workspaces
RUN npm install -g npm@10

# Copy root configurations
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared packages FIRST
COPY packages/shared-types ./packages/shared-types
COPY packages/db ./packages/db
COPY packages/gemini-client ./packages/gemini-client

# Copy this specific microservice
COPY services/voice-assembly ./services/voice-assembly

# Install dependencies at the workspace root
RUN npm install

# Build shared packages
RUN npm run build -w @nexus-civic/shared-types
RUN npm run build -w @nexus-civic/db
RUN npm run build -w @nexus-civic/gemini-client

# Build the microservice
RUN npm run build -w voice-assembly

# Expose port
EXPOSE 3008

# Start the service
CMD ["npm", "start", "-w", "voice-assembly"]
