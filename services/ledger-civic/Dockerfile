FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace configuration
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy shared packages
COPY packages/shared-types ./packages/shared-types
COPY packages/db ./packages/db
COPY packages/gemini-client ./packages/gemini-client

# Copy the service
COPY services/ledger-civic ./services/ledger-civic

# Install dependencies and build
RUN npm ci
RUN npm run build --workspace=@nexus-civic/shared-types
RUN npm run build --workspace=@nexus-civic/db
RUN npm run build --workspace=@nexus-civic/gemini-client
RUN npm run build --workspace=@nexus-civic/ledger-civic

EXPOSE 3009

CMD ["npm", "start", "--workspace=@nexus-civic/ledger-civic"]
