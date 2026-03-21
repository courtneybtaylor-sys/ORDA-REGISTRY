#!/bin/bash

# ORDA Registry API Endpoints Test Script
# This script tests all 5 REST API endpoints

set -e

BASE_URL="http://localhost:3000"
API_KEY="your-api-key-here"  # Set your ORDA_INTERNAL_API_KEY

echo "=========================================="
echo "ORDA Registry API Endpoints Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local headers=$5

  echo -e "${YELLOW}Testing: ${name}${NC}"
  echo "Method: $method"
  echo "Endpoint: $endpoint"

  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "${BASE_URL}${endpoint}" $headers)
  else
    response=$(curl -s -X "$method" "${BASE_URL}${endpoint}" -H "Content-Type: application/json" $headers -d "$data")
  fi

  echo "Response:"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"
  echo ""
}

echo "=========================================="
echo "ENDPOINT 1: GET /api/testament/[id]"
echo "=========================================="
test_endpoint "Get Testament by ID" "GET" "/api/testament/test-id" "" ""

echo ""
echo "=========================================="
echo "ENDPOINT 2: GET /api/identities"
echo "=========================================="
test_endpoint "Get Identities List" "GET" "/api/identities?page=1&limit=10" "" ""

echo "With jurisdiction filter:"
test_endpoint "Get Identities by Jurisdiction" "GET" "/api/identities?jurisdiction=US&status=active" "" ""

echo ""
echo "=========================================="
echo "ENDPOINT 3: GET /api/metrics"
echo "=========================================="
test_endpoint "Get Metrics (30 days)" "GET" "/api/metrics?timeframe=30d" "" ""

echo "With jurisdiction breakdown:"
test_endpoint "Get Metrics by Jurisdiction" "GET" "/api/metrics?timeframe=90d&groupBy=jurisdiction" "" ""

echo "With product breakdown:"
test_endpoint "Get Metrics by Product" "GET" "/api/metrics?timeframe=60d&groupBy=product" "" ""

echo ""
echo "=========================================="
echo "ENDPOINT 4: POST /api/testament/log"
echo "=========================================="

# Create sample testament data with 7 gates
TESTAMENT_DATA=$(cat <<'EOF'
{
  "actorDid": "did:example:actor123",
  "timestamp": "2024-03-17T10:30:00Z",
  "gatesEvaluation": [
    {
      "gate": "identity_verification",
      "passed": true,
      "score": 95,
      "details": "Identity verified against trusted registry",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    },
    {
      "gate": "credential_validation",
      "passed": true,
      "score": 92,
      "details": "All credentials validated and signed",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    },
    {
      "gate": "hardware_security",
      "passed": true,
      "score": 88,
      "details": "Hardware security module verified",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    },
    {
      "gate": "data_integrity",
      "passed": true,
      "score": 90,
      "details": "Data integrity checks passed",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    },
    {
      "gate": "audit_compliance",
      "passed": true,
      "score": 85,
      "details": "Audit trail verified",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    },
    {
      "gate": "governance_framework",
      "passed": true,
      "score": 87,
      "details": "Governance framework compliant",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    },
    {
      "gate": "regulatory_approval",
      "passed": true,
      "score": 89,
      "details": "Regulatory approval obtained",
      "evaluatedAt": "2024-03-17T10:30:00Z"
    }
  ],
  "jurisdiction": "US",
  "nistCompliant": true
}
EOF
)

echo "With valid API key (set ORDA_INTERNAL_API_KEY):"
test_endpoint "Log Testament" "POST" "/api/testament/log" "$TESTAMENT_DATA" "-H 'Authorization: Bearer $API_KEY'"

echo "Without API key (should fail with 401):"
test_endpoint "Log Testament - Unauthorized" "POST" "/api/testament/log" "$TESTAMENT_DATA" ""

echo ""
echo "=========================================="
echo "ENDPOINT 5: GET /api/compliance"
echo "=========================================="
test_endpoint "Get Compliance Proof" "GET" "/api/compliance?testament_id=test-id" "" ""

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}All endpoint tests completed!${NC}"
echo ""
echo "Notes:"
echo "1. Make sure the development server is running: npm run dev"
echo "2. Update API_KEY variable with your ORDA_INTERNAL_API_KEY"
echo "3. Test IDs may return 404 if data doesn't exist in database"
echo "4. Check response headers for CORS and cache headers"
echo ""
