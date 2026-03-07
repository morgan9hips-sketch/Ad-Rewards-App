#!/usr/bin/env bash
# =============================================================================
# V2 API Smoke Tests
# Run against a locally started backend (npm run dev inside backend/) or
# a deployed Vercel instance.
#
# Usage:
#   BASE_URL=http://localhost:4000 TOKEN=<bearer-token> bash scripts/validate-v2.sh
#   BASE_URL=https://your-app.vercel.app TOKEN=<bearer-token> bash scripts/validate-v2.sh
# =============================================================================
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
TOKEN="${TOKEN:-}"
PASS=0
FAIL=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASS++)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAIL++)); }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
get_status() {
  local url="$1"
  shift
  curl -s -o /dev/null -w "%{http_code}" "$@" "$url"
}

# ---------------------------------------------------------------------------
# 1. Health check
# ---------------------------------------------------------------------------
info "1. Health check"
code=$(get_status "$BASE_URL/health")
if [[ "$code" == "200" ]]; then
  pass "GET /health → 200"
else
  fail "GET /health → $code (expected 200)"
fi

# ---------------------------------------------------------------------------
# 2. V2 rewards (public)
# ---------------------------------------------------------------------------
info "2. GET /api/v2/rewards (public)"
code=$(get_status "$BASE_URL/api/v2/rewards")
if [[ "$code" == "200" ]]; then
  pass "GET /api/v2/rewards → 200"
else
  fail "GET /api/v2/rewards → $code (expected 200)"
fi

# ---------------------------------------------------------------------------
# 3. V2 wallet (requires auth)
# ---------------------------------------------------------------------------
info "3. GET /api/v2/wallet (requires auth)"
if [[ -n "$TOKEN" ]]; then
  code=$(get_status "$BASE_URL/api/v2/wallet" -H "Authorization: Bearer $TOKEN")
  if [[ "$code" == "200" ]]; then
    pass "GET /api/v2/wallet → 200"
  else
    fail "GET /api/v2/wallet → $code (expected 200)"
  fi
else
  code=$(get_status "$BASE_URL/api/v2/wallet")
  if [[ "$code" == "401" ]]; then
    pass "GET /api/v2/wallet without token → 401 (correct)"
  else
    fail "GET /api/v2/wallet without token → $code (expected 401)"
  fi
fi

# ---------------------------------------------------------------------------
# 4. V2 claims list (requires auth)
# ---------------------------------------------------------------------------
info "4. GET /api/v2/claims (requires auth)"
if [[ -n "$TOKEN" ]]; then
  code=$(get_status "$BASE_URL/api/v2/claims" -H "Authorization: Bearer $TOKEN")
  if [[ "$code" == "200" ]]; then
    pass "GET /api/v2/claims → 200"
  else
    fail "GET /api/v2/claims → $code (expected 200)"
  fi
else
  code=$(get_status "$BASE_URL/api/v2/claims")
  if [[ "$code" == "401" ]]; then
    pass "GET /api/v2/claims without token → 401 (correct)"
  else
    fail "GET /api/v2/claims without token → $code (expected 401)"
  fi
fi

# ---------------------------------------------------------------------------
# 5. V2 admin/credit (requires admin auth)
# ---------------------------------------------------------------------------
info "5. POST /api/v2/admin/credit without auth → 401"
code=$(get_status "$BASE_URL/api/v2/admin/credit" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}')
if [[ "$code" == "401" ]]; then
  pass "POST /api/v2/admin/credit without token → 401 (correct)"
else
  fail "POST /api/v2/admin/credit without token → $code (expected 401)"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "============================================="
echo "Results: ${PASS} passed, ${FAIL} failed"
echo "============================================="
[[ "$FAIL" -eq 0 ]] && exit 0 || exit 1
