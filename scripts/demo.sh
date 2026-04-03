#!/bin/bash
# Nexus Civic - Hackathon Demo Setup Script
# Run this 5 minutes before your presentation
set -e

echo "Setting up Nexus Civic demo..."

check_service() { curl -sf "http://localhost:$1/health" > /dev/null 2>&1; }

echo "Checking services..."
for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011; do
  check_service "$port" && echo "  OK  Port $port" || echo "  NOT RUNNING Port $port - run: docker compose up -d"
done

echo ""
echo "Checking demo data..."
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/nexus-civic}"

# Keep variable intentionally available for local shell-based checks/extensions.
export MONGO_URI

echo "Creating live demo SOS event (appears on dashboard heatmap)..."
curl -sf -X POST http://localhost:3001/api/sos/trigger \
  -H "Content-Type: application/json" \
  -d '{"type":"tap","location":{"lat":23.1815,"lng":79.9864,"address":"Civil Lines, Jabalpur"},"userId":"demo-user-001"}' \
  && echo "  OK  SOS event created" || echo "  WARN SOS trigger failed"

echo "Creating critical grievance (shows escalation)..."
curl -sf -X POST http://localhost:3002/api/grievances \
  -H "Content-Type: application/json" \
  -d '{"title":"Water pipeline burst on Napier Town road","description":"Large water pipeline has burst near main intersection causing flooding and road blockage","category":"water","district":"jabalpur","location":{"lat":23.1656,"lng":79.9553,"address":"Napier Town, Jabalpur"}}' \
  && echo "  OK  Grievance created" || echo "  WARN Grievance creation failed"

echo ""
echo "Demo ready"
echo ""
echo "========================================"
echo "  DEMO CREDENTIALS"
echo "  Admin:   admin@nexuscivic.demo / demo123"
echo "  Officer: officer@nexuscivic.demo / demo123"
echo "  Citizen: citizen@nexuscivic.demo / demo123"
echo ""
echo "  DEMO URLS"
echo "  Dashboard: http://localhost:3000/dashboard"
echo "  Citizen:   http://localhost:3000/safety"
echo "  Budget:    http://localhost:3000/budget"
echo "========================================"
echo ""
echo "5-MINUTE DEMO SEQUENCE:"
echo "  0:00 - Open dashboard. Point to 5 KPI cards + live dot"
echo "  0:30 - Click safety heatmap. Point to colored S2 cells"
echo "  1:00 - Show Grievance Queue. Point to CRITICAL red entry"
echo "  1:45 - Show Risk Zones. Click 'Dispatch Patrol'. Show dispatch"
echo "  2:15 - Open Town Hall page. Show live vote count updating"
echo "  2:45 - Open Budget page. Click a Solana link. Show explorer"
echo "  3:15 - Open AuraAssist Audit Log. Point to BLOCKED entries in red"
echo "  3:45 - Open mobile app (Expo Go) / screenshot. Show SOS button"
echo "  4:15 - Answer judge questions"
