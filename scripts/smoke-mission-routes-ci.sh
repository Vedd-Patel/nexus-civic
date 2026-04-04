#!/usr/bin/env bash
set -euo pipefail

# Deterministic CI smoke test for:
# - SentinelAI (3007)
#
# Required env:
#   ADMIN_TOKEN=<jwt>
#   OFFICER_TOKEN=<jwt>
#
# Optional env:
#   BASE_SENTINEL_AI=http://localhost:3007
#   SENTINEL_PREDICTION_ID=<existing prediction id>

BASE_SENTINEL_AI="${BASE_SENTINEL_AI:-http://localhost:3007}"
SENTINEL_PREDICTION_ID="${SENTINEL_PREDICTION_ID:-}"

ADMIN_TOKEN="${ADMIN_TOKEN:?ADMIN_TOKEN is required}"
OFFICER_TOKEN="${OFFICER_TOKEN:?OFFICER_TOKEN is required}"

PASS=0

log() {
  printf "\n[%s] %s\n" "$1" "$2"
}

request() {
  local name="$1"
  local expected_code="$2"
  shift 2

  local body_file
  body_file="$(mktemp)"

  local code
  code="$(curl -sS -o "$body_file" -w "%{http_code}" "$@")"

  if [[ "$code" != "$expected_code" ]]; then
    printf "FAIL %s (expected %s got %s)\n" "$name" "$expected_code" "$code"
    printf "Body: %s\n" "$(tr '\n' ' ' < "$body_file" | head -c 500)"
    rm -f "$body_file"
    exit 1
  fi

  PASS=$((PASS + 1))
  printf "PASS %s (status %s)\n" "$name" "$code"
  printf "%s" "$body_file"
}

json_field() {
  local file="$1"
  local field="$2"

  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const field = process.argv[2];
    const parts = field.split(".");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    let cur = data;
    for (const p of parts) cur = cur?.[p];
    if (cur == null) process.exit(2);
    process.stdout.write(String(cur));
  ' "$file" "$field"
}

log "SentinelAI" "Validating prediction endpoints and strict dispatch flow"

request "GET /api/predictions/heatmap" "200" \
  -X GET "${BASE_SENTINEL_AI}/api/predictions/heatmap" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" >/dev/null

zones_body="$(request "GET /api/predictions/top-zones" "200" \
  -X GET "${BASE_SENTINEL_AI}/api/predictions/top-zones" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")"

if [[ -z "$SENTINEL_PREDICTION_ID" ]]; then
  SENTINEL_PREDICTION_ID="$(json_field "$zones_body" "0._id" || true)"
fi
rm -f "$zones_body"

if [[ -z "$SENTINEL_PREDICTION_ID" ]]; then
  echo "No prediction available for dispatch. Provide SENTINEL_PREDICTION_ID or pre-seed predictions."
  exit 1
fi

request "POST /api/dispatch/trigger" "200" \
  -X POST "${BASE_SENTINEL_AI}/api/dispatch/trigger" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"predictionId\":\"${SENTINEL_PREDICTION_ID}\"}" >/dev/null

request "GET /api/dispatch/active (admin)" "200" \
  -X GET "${BASE_SENTINEL_AI}/api/dispatch/active" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" >/dev/null

request "POST /api/dispatch/:id/ack (officer)" "200" \
  -X POST "${BASE_SENTINEL_AI}/api/dispatch/${SENTINEL_PREDICTION_ID}/ack" \
  -H "Authorization: Bearer ${OFFICER_TOKEN}" >/dev/null

log "Result" "All deterministic checks passed: ${PASS} assertions"
