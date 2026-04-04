#!/bin/bash
# ============================================================
# Nexus Civic — Quick Deploy / Redeploy Script  
# Run from the nexus-civic directory on your Vultr server
# Usage: bash deploy/deploy.sh
# ============================================================

set -e

echo "🚀 Deploying Nexus Civic..."

# Check .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    echo "   Run: cp .env.example .env.production && nano .env.production"
    exit 1
fi

# Pull latest code
echo "[1/4] Pulling latest code..."
git pull origin main 2>/dev/null || echo "Skipping git pull (not a git repo or no remote)"

# Build and deploy
echo "[2/4] Building containers (this takes 3-5 min first time)..."
docker compose -f docker-compose.prod.yml build

echo "[3/4] Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "[4/4] Waiting for services to start..."
sleep 10

# Health check
echo ""
echo "==========================================="
echo "  Service Status:"
echo "==========================================="
docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
echo "==========================================="
echo "  ✅ Deployment complete!"
echo "  🌐 Open: http://$SERVER_IP"
echo "==========================================="
