# ORDA Registry API - cURL Examples

This file contains cURL commands for testing all 5 REST API endpoints.

## Setup

Set up your environment variables:
```bash
export BASE_URL="http://localhost:3000"
export API_KEY="your-orda-internal-api-key"
```

Make sure the development server is running:
```bash
npm run dev
```

---

## Endpoint 1: Get Testament by ID

### Basic request:
```bash
curl -X GET "${BASE_URL}/api/testament/test-id" \
  -H "Content-Type: application/json"
```

### With response formatting:
```bash
curl -s -X GET "${BASE_URL}/api/testament/test-id" \
  -H "Content-Type: application/json" | jq '.'
```

### Check response headers:
```bash
curl -i -X GET "${BASE_URL}/api/testament/test-id" \
  -H "Content-Type: application/json"
```

---

## Endpoint 2: Browse Identities

### Basic request (first 20):
```bash
curl -X GET "${BASE_URL}/api/identities" \
  -H "Content-Type: application/json"
```

### With pagination:
```bash
curl -X GET "${BASE_URL}/api/identities?page=2&limit=10" \
  -H "Content-Type: application/json" | jq '.'
```

### Filter by jurisdiction:
```bash
curl -X GET "${BASE_URL}/api/identities?jurisdiction=US&limit=10" \
  -H "Content-Type: application/json" | jq '.'
```

### Filter by status:
```bash
curl -X GET "${BASE_URL}/api/identities?status=active&limit=10" \
  -H "Content-Type: application/json" | jq '.'
```

### Filter by product:
```bash
curl -X GET "${BASE_URL}/api/identities?product=Guardian&limit=10" \
  -H "Content-Type: application/json" | jq '.'
```

### Combine filters:
```bash
curl -X GET "${BASE_URL}/api/identities?jurisdiction=US&status=active&product=Sentinel&page=1&limit=5" \
  -H "Content-Type: application/json" | jq '.'
```

---

## Endpoint 3: Retrieve Metrics

### Get metrics for last 30 days:
```bash
curl -X GET "${BASE_URL}/api/metrics?timeframe=30d" \
  -H "Content-Type: application/json" | jq '.'
```

### Get metrics for last 60 days:
```bash
curl -X GET "${BASE_URL}/api/metrics?timeframe=60d" \
  -H "Content-Type: application/json" | jq '.'
```

### Get metrics for last 90 days:
```bash
curl -X GET "${BASE_URL}/api/metrics?timeframe=90d" \
  -H "Content-Type: application/json" | jq '.'
```

### Get metrics with jurisdiction breakdown:
```bash
curl -X GET "${BASE_URL}/api/metrics?timeframe=30d&groupBy=jurisdiction" \
  -H "Content-Type: application/json" | jq '.'
```

### Get metrics with product breakdown:
```bash
curl -X GET "${BASE_URL}/api/metrics?timeframe=60d&groupBy=product" \
  -H "Content-Type: application/json" | jq '.'
```

---

## Endpoint 4: Log Testament (Internal)

### Create testament with all 7 gates:
```bash
curl -X POST "${BASE_URL}/api/testament/log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
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
  }' | jq '.'
```

### Test without API key (should return 401):
```bash
curl -X POST "${BASE_URL}/api/testament/log" \
  -H "Content-Type: application/json" \
  -d '{
    "actorDid": "did:example:actor123",
    "timestamp": "2024-03-17T10:30:00Z",
    "gatesEvaluation": []
  }' | jq '.'
```

### Test with invalid gate count (should return 400):
```bash
curl -X POST "${BASE_URL}/api/testament/log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
    "actorDid": "did:example:actor123",
    "timestamp": "2024-03-17T10:30:00Z",
    "gatesEvaluation": [
      {
        "gate": "identity_verification",
        "passed": true,
        "score": 95,
        "details": "Test"
      }
    ]
  }' | jq '.'
```

### Test with invalid score (should return 400):
```bash
curl -X POST "${BASE_URL}/api/testament/log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
    "actorDid": "did:example:actor123",
    "timestamp": "2024-03-17T10:30:00Z",
    "gatesEvaluation": [
      {
        "gate": "identity_verification",
        "passed": true,
        "score": 150,
        "details": "Test"
      }
    ]
  }' | jq '.'
```

---

## Endpoint 5: Generate NIST Compliance Proof

### Get compliance proof for testament:
```bash
curl -X GET "${BASE_URL}/api/compliance?testament_id=test-id" \
  -H "Content-Type: application/json" | jq '.'
```

### Using query parameter name variations:
```bash
curl -X GET "${BASE_URL}/api/compliance?testamentId=test-id" \
  -H "Content-Type: application/json" | jq '.'
```

### Check response headers:
```bash
curl -i -X GET "${BASE_URL}/api/compliance?testament_id=test-id" \
  -H "Content-Type: application/json"
```

---

## Testing CORS Headers

### Check CORS headers on any endpoint:
```bash
curl -i -X OPTIONS "${BASE_URL}/api/identities"
```

Expected headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

---

## Testing Caching Headers

### Check cache headers on immutable endpoints (testament, compliance):
```bash
curl -i -X GET "${BASE_URL}/api/testament/test-id"
```

Expected: `Cache-Control: public, max-age=31536000, immutable`

### Check cache headers on identities:
```bash
curl -i -X GET "${BASE_URL}/api/identities"
```

Expected: `Cache-Control: public, max-age=300`

### Check cache headers on metrics:
```bash
curl -i -X GET "${BASE_URL}/api/metrics"
```

Expected: `Cache-Control: no-cache, no-store, must-revalidate`

---

## Save output to file

### Get testament and save to file:
```bash
curl -s -X GET "${BASE_URL}/api/testament/test-id" \
  -H "Content-Type: application/json" | jq '.' > testament.json
```

### Get identities and save to file:
```bash
curl -s -X GET "${BASE_URL}/api/identities" \
  -H "Content-Type: application/json" | jq '.' > identities.json
```

---

## Debugging

### Show all response headers:
```bash
curl -i -X GET "${BASE_URL}/api/identities"
```

### Show request details (verbose):
```bash
curl -v -X GET "${BASE_URL}/api/identities" \
  -H "Content-Type: application/json"
```

### Show response timing:
```bash
curl -w "\nTime connect: %{time_connect}\nTime total: %{time_total}\n" \
  -X GET "${BASE_URL}/api/identities"
```

---

## Integration Testing Script

Create a file `test-all.sh`:

```bash
#!/bin/bash
set -e

BASE_URL="http://localhost:3000"
API_KEY="your-api-key"

echo "Testing all endpoints..."

echo "1. Testing /api/testament/[id]"
curl -s "${BASE_URL}/api/testament/test-id" | jq '.'

echo -e "\n2. Testing /api/identities"
curl -s "${BASE_URL}/api/identities?page=1&limit=5" | jq '.'

echo -e "\n3. Testing /api/metrics"
curl -s "${BASE_URL}/api/metrics?timeframe=30d" | jq '.'

echo -e "\n4. Testing /api/testament/log"
curl -s -X POST "${BASE_URL}/api/testament/log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{...}' | jq '.'

echo -e "\n5. Testing /api/compliance"
curl -s "${BASE_URL}/api/compliance?testament_id=test-id" | jq '.'

echo -e "\nAll tests completed!"
```

Run with:
```bash
bash test-all.sh
```

