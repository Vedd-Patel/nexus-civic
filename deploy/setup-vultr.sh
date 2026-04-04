#!/bin/bash
# ============================================================
# Nexus Civic — Vultr VPS Setup Script
# Run this ONCE on a fresh Ubuntu 22.04+ Vultr server
# Usage: ssh root@YOUR_IP "bash -s" < deploy/setup-vultr.sh
# ============================================================

set -e

echo "==========================================="
echo "  Nexus Civic — Vultr Server Setup"
echo "==========================================="

# 1. Update system
echo "[1/5] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# 2. Install Docker
echo "[2/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed ✓"
else
    echo "Docker already installed ✓"
fi

# 3. Install Docker Compose plugin
echo "[3/5] Checking Docker Compose..."
if docker compose version &> /dev/null; then
    echo "Docker Compose already available ✓"
else
    apt-get install -y docker-compose-plugin
    echo "Docker Compose installed ✓"
fi

# 4. Install Git
echo "[4/5] Installing Git..."
apt-get install -y git
echo "Git installed ✓"

# 5. Setup firewall
echo "[5/5] Configuring firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS (for future SSL)
ufw --force enable
echo "Firewall configured ✓"

echo ""
echo "==========================================="
echo "  Server ready! Next steps:"
echo "==========================================="
echo ""
echo "  1. Clone your repo:"
echo "     git clone https://github.com/YOUR_USER/nexus-civic.git"
echo "     cd nexus-civic"
echo ""
echo "  2. Create production env file:"
echo "     cp .env.example .env.production"
echo "     nano .env.production"
echo ""
echo "  3. Deploy:"
echo "     docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "  4. Check status:"
echo "     docker compose -f docker-compose.prod.yml ps"
echo ""
echo "  Your app will be at: http://YOUR_SERVER_IP"
echo "==========================================="
