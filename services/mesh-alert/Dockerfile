FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/mesh-alert/ ./services/mesh-alert/

RUN npm install
RUN npm run build --workspaces

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/mesh-alert ./services/mesh-alert

WORKDIR /app/services/mesh-alert
EXPOSE 3010

CMD ["npm", "start"]
