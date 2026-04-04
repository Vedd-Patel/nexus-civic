#!/usr/bin/env bash
set -u

# Smoke test for active services:
# - SentinelAI (3007)
#
# Usage:
#   chmod +x scripts/smoke-mission-routes.sh
#   ADMIN_TOKEN=<jwt> OFFICER_TOKEN=<jwt> ./scripts/smoke-mission-routes.sh
#
# Optional env vars:
#   BASE_SENTINEL_AI=http://localhost:3007

BASE_SENTINEL_AI="${BASE_SENTINEL_AI:-http://localhost:3007}"

ADMIN_TOKEN="${ADMIN_TOKEN:-}"
OFFICER_TOKEN="${OFFICER_TOKEN:-}"

PASS=0
FAIL=0
PREDICTION_ID=""

print_step() {
  printf "\n[%s] %s\n" "$1" "$2"
}

run_request() {
  local name="$1"
  local expected="$2"
  shift 2

  local tmp_body
  tmp_body="$(mktemp)"

  local code
  code="$(curl -sS -o "$tmp_body" -w "%{http_code}" "$@")"

  if [[ "$code" == "$expected" ]]; then
    printf "PASS  %s (status %s)\n" "$name" "$code"
    PASS=$((PASS + 1))
  else
    printf "FAIL  %s (expected %s got %s)\n" "$name" "$expected" "$code"
    printf "      body: %s\n" "$(tr '\n' ' ' < "$tmp_body" | head -c 260)"
    FAIL=$((FAIL + 1))
  fi

  rm -f "$tmp_body"
}

extract_json_field() {
  local url="$1"
  local field="$2"
  local header_name="${3:-}"
  local header_value="${4:-}"

  local tmp_body
  tmp_body="$(mktemp)"

  if [[ -n "$header_name" ]]; then
    curl -sS -H "$header_name: $header_value" "$url" > "$tmp_body"
  else
    curl -sS "$url" > "$tmp_body"
  fi

  local value
  value="$(node -e '
    const fs = require("fs");
    const f = process.argv[1];
    const field = process.argv[2];
    try {
      const j = JSON.parse(fs.readFileSync(f, "utf8"));
      const parts = field.split(".");
      let cur = j;
      for (const p of parts) {
        cur = cur?.[p];
      }
      process.stdout.write(cur == null ? "" : String(cur));
    } catch {
      process.stdout.write("");
    }
  ' "$tmp_body" "$field")"

  rm -f "$tmp_body"
  printf "%s" "$value"
}

print_step "SentinelAI" "Checking predictions and dispatch routes on ${BASE_SENTINEL_AI}"

if [[ -n "$ADMIN_TOKEN" ]]; then
  run_request "GET /api/predictions/heatmap (admin)" "200" \
    -X GET "${BASE_SENTINEL_AI}/api/predictions/heatmap" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}"

  run_request "GET /api/predictions/top-zones (admin)" "200" \
    -X GET "${BASE_SENTINEL_AI}/api/predictions/top-zones" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}"
else
  printf "SKIP  Admin prediction routes (set ADMIN_TOKEN)\n"
fi

if [[ -n "$ADMIN_TOKEN" ]]; then
  PREDICTION_ID="$(extract_json_field "${BASE_SENTINEL_AI}/api/predictions/top-zones" "0._id" "Authorization" "Bearer ${ADMIN_TOKEN}")"
fi

if [[ -n "$ADMIN_TOKEN" && -n "$PREDICTION_ID" ]]; then
  run_request "POST /api/dispatch/trigger (admin)" "200" \
    -X POST "${BASE_SENTINEL_AI}/api/dispatch/trigger" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"predictionId\":\"${PREDICTION_ID}\"}"
else
  printf "SKIP  POST /api/dispatch/trigger (need ADMIN_TOKEN and prediction data)\n"
fi

if [[ -n "$ADMIN_TOKEN" ]]; then
  run_request "GET /api/dispatch/active (admin+officer)" "200" \
    -X GET "${BASE_SENTINEL_AI}/api/dispatch/active" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}"
else
  printf "SKIP  GET /api/dispatch/active (set ADMIN_TOKEN or OFFICER_TOKEN)\n"
fi

if [[ -n "$OFFICER_TOKEN" && -n "$PREDICTION_ID" ]]; then
  run_request "POST /api/dispatch/:id/ack (officer)" "200" \
    -X POST "${BASE_SENTINEL_AI}/api/dispatch/${PREDICTION_ID}/ack" \
    -H "Authorization: Bearer ${OFFICER_TOKEN}"
else
  printf "SKIP  POST /api/dispatch/:id/ack (need OFFICER_TOKEN and prediction data)\n"
fi

printf "\nSummary: PASS=%s FAIL=%s\n" "$PASS" "$FAIL"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
