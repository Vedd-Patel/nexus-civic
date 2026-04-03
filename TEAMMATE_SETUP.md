# Nexus Civic - Teammate Setup Guide

## Prerequisites to install (with links)
- Node.js v20+: https://nodejs.org
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Git: https://git-scm.com/downloads
- VS Code (optional but recommended): https://code.visualstudio.com
- Google Antigravity (optional, for building): https://antigravity.google/download

## One-Time Setup (10 minutes)
```bash
git clone https://github.com/REPO_URL/nexus-civic.git
cd nexus-civic
cp .env.example .env
```

Then edit `.env`.

Required for a basic run:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `JWT_SECRET`

Optional (sponsor-track and extended integrations):
- Everything else in `.env.example` (ElevenLabs, Superplane, ArmorIQ, Solana, SpacetimeDB, Vultr, Firebase, News API, etc.)

Tip for local Docker-only demo setup:
- Set `MONGODB_URI=mongodb://mongodb:27017/nexus_civic` in `.env` so containers can reach MongoDB by service name.

## Running the Project

### Option A: Docker (Recommended - everything in one command)
```bash
docker compose up -d        # Start all services in background
npm run seed                # Seed demo data (run once)
# Open http://localhost:3000/dashboard
```

### Option B: Manual (for development)
```bash
npm install                 # Install all workspace dependencies
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 --name mongo mongo:7.0
# Terminal 2-12: Start each service
cd services/guardian-net && npm run dev
# ... repeat for each service (or use turbo: npm run dev from root)
# Terminal 13: Start frontend
cd apps/web && npm run dev
```

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexuscivic.demo | demo123 |
| Officer | officer@nexuscivic.demo | demo123 |
| Citizen | citizen@nexuscivic.demo | demo123 |

## Service URLs

| Service | URL | Port | What it does |
|---|---|---:|---|
| GuardianNet | http://localhost:3001/health | 3001 | SOS detection, emergency event lifecycle, response coordination |
| PulseReport | http://localhost:3002/health | 3002 | Grievance intake, categorization, status workflow, analytics |
| CivicPulse | http://localhost:3003/health | 3003 | Social signal ingestion, sentiment + urgency scoring, fact-check flows |
| GigForge | http://localhost:3004/health | 3004 | Local task marketplace, worker matching, fraud-scored listing moderation |
| NearGive | http://localhost:3005/health | 3005 | Donation intake, quality checks, NGO matching and delivery lifecycle |
| TerraScan | http://localhost:3006/health | 3006 | Environmental/geospatial risk detection and region-level alerts |
| SentinelAI | http://localhost:3007/health | 3007 | Risk prediction, patrol dispatch triggers, monitoring intelligence |
| VoiceAssembly | http://localhost:3008/health | 3008 | Real-time town hall sessions, issue submission, live voting sync |
| LedgerCivic | http://localhost:3009/health | 3009 | Public spending ledger, anomaly detection, transparency reports |
| MeshAlert | http://localhost:3010/health | 3010 | Resilient mesh sync + rescue event exchange for degraded networks |
| AuraAssist | http://localhost:3011/health | 3011 | AI assistant API, policy-gated actions, audit logging |
| Web | http://localhost:3000 | 3000 | Unified dashboard + role-based UX for demos and operations |

## Common Issues & Fixes
- `node-s2` build error: run `npm install --build-from-source` in `services/guardian-net/`
- Port already in use: `lsof -ti:3001 | xargs kill` (replace `3001` with your blocked port)
- MongoDB connection refused: verify `MONGODB_URI` in `.env`
- Gemini rate limit: built-in retry/backoff handles transient limits automatically
- Docker out of memory: increase Docker Desktop memory to at least 6 GB

## Architecture Overview

```text
                            +----------------------+
                            |  apps/web (3000)     |
                            |  Unified Dashboard   |
                            +----------+-----------+
                                       |
        -------------------------------------------------------------------
        |         |         |         |         |         |         |      |
+-------v--+ +----v-----+ +--v------+ +--v------+ +--v------+ +--v------+ +--v------+
|guardian  | |pulse-    | |civic-   | |gig-     | |near-    | |terra-    | |sentinel |
|net 3001  | |report3002| |pulse3003| |forge3004| |give3005 | |scan3006  | |ai 3007  |
+----------+ +----------+ +---------+ +---------+ +---------+ +----------+ +---------+
        |            |            |            |            |            |           |
        -----------------------------------------------------------------------------
                                       |
                           +-----------v------------+
                           | Shared Packages         |
                           | packages/db             |
                           | packages/shared-types   |
                           | packages/gemini-client  |
                           +-----------+------------+
                                       |
                               +-------v--------+
                               | MongoDB 27017  |
                               | (models/data)  |
                               +----------------+

+----------------+   +----------------+   +----------------+   +----------------+
|voice-assembly  |   |ledger-civic    |   |mesh-alert      |   |aura-assist     |
|3008            |   |3009            |   |3010            |   |3011            |
+----------------+   +----------------+   +----------------+   +----------------+
```
