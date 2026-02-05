#!/bin/bash

# Pre-Deployment Validation Script
# This script checks all requirements before deploying to production

set -e  # Exit on any error

echo "🔍 Starting Pre-Deployment Validation..."
echo ""

FAILED=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Checking Environment Variables..."
echo "-----------------------------------"

# Check Wise credentials
if [ -z "$WISE_API_TOKEN" ] || [ "$WISE_API_TOKEN" = "your_wise_api_token_here" ]; then
    echo -e "${RED}❌ WISE_API_TOKEN not configured or is placeholder${NC}"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ WISE_API_TOKEN configured${NC}"
fi

if [ -z "$WISE_PROFILE_ID" ] || [ "$WISE_PROFILE_ID" = "your_wise_profile_id_here" ]; then
    echo -e "${RED}❌ WISE_PROFILE_ID not configured or is placeholder${NC}"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ WISE_PROFILE_ID configured${NC}"
fi

echo ""
echo "======================================="
echo "Validation Complete!"
echo "======================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo "✨ Ready for deployment"
    exit 0
else
    echo -e "${RED}❌ $FAILED CHECK(S) FAILED!${NC}"
    echo "🚫 NOT ready for deployment"
    exit 1
fi
