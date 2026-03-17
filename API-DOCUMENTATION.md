# ORDA Registry REST API Documentation

## Overview

The ORDA Registry provides 5 REST API endpoints for managing testaments, identities, metrics, and compliance information. All endpoints support CORS and include proper error handling, request/response logging, and caching headers.

---

## Endpoint 1: GET /api/testament/[id]

**Purpose**: Lookup and retrieve a testament by ID with complete gate evaluations

### Request

```bash
GET /api/testament/:id
```

**Query Parameters:**
- `id` (required, string): Testament ID

**Headers:**
- `CORS`: Enabled

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "test-123",
    "identityId": "identity-456",
    "actorDid": "did:example:actor123",
    "timestamp": "2024-03-17T10:30:00Z",
    "isActive": true,
    "createdAt": "2024-03-17T10:30:00Z",
    "updatedAt": "2024-03-17T10:30:00Z",
    "gatesEvaluation": [
      {
        "gate": "identity_verification",
        "passed": true,
        "score": 95,
        "details": "Identity verified",
        "evaluatedAt": "2024-03-17T10:30:00Z"
      }
      // ... 6 more gates
    ],
    "overallScore": 90,
    "jurisdiction": "US",
    "nistCompliant": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Testament ID is required
- `404 Not Found`: Testament not found
- `500 Internal Server Error`: Database error

**Caching:**
- `Cache-Control: public, max-age=31536000, immutable` (1 year)

---

## Endpoint 2: GET /api/identities

**Purpose**: Browse identity ledger with filtering and pagination

### Request

```bash
GET /api/identities?page=1&limit=20&jurisdiction=US&status=active&product=AI_AGENT
```

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page, max 100 (default: 20)
- `jurisdiction` (optional, string): Filter by jurisdiction (e.g., "US", "EU")
- `status` (optional, string): Filter by status: "active", "inactive", "pending"
- `product` (optional, string): Filter by product type

**Headers:**
- `CORS`: Enabled

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "identity-1",
        "publicKey": "pk_123...",
        "name": "AI Agent Alpha",
        "type": "ai_agent",
        "email": "agent@example.com",
        "jurisdiction": "US",
        "status": "active",
        "product": "Guardian",
        "createdAt": "2024-03-17T10:30:00Z",
        "updatedAt": "2024-03-17T10:30:00Z",
        "testamentCount": 5
      }
      // ... more identities
    ],
    "totalCount": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "message": "Retrieved 20 identities"
}
```

**Error Responses:**
- `405 Method Not Allowed`: Only GET allowed
- `500 Internal Server Error`: Database error

**Caching:**
- `Cache-Control: public, max-age=300` (5 minutes)

---

## Endpoint 3: GET /api/metrics

**Purpose**: Retrieve governance metrics and compliance statistics

### Request

```bash
GET /api/metrics?timeframe=30d&groupBy=jurisdiction
```

**Query Parameters:**
- `timeframe` (optional, string): "30d", "60d", or "90d" (default: "30d")
- `groupBy` (optional, string): "jurisdiction" or "product" for breakdown

**Headers:**
- `CORS`: Enabled

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "registryHealth": {
      "totalIdentities": 450,
      "totalTestaments": 1250,
      "activeTestaments": 1100,
      "overallComplianceScore": 87
    },
    "byJurisdiction": {
      "US": {
        "testamentCount": 600,
        "complianceScore": 89
      },
      "EU": {
        "testamentCount": 400,
        "complianceScore": 85
      },
      "ASIA": {
        "testamentCount": 250,
        "complianceScore": 82
      }
    }
  }
}
```

**Example with groupBy=product:**
```json
{
  "success": true,
  "data": {
    "registryHealth": { ... },
    "byProduct": {
      "Guardian": {
        "testamentCount": 500,
        "complianceScore": 88
      },
      "Sentinel": {
        "testamentCount": 400,
        "complianceScore": 86
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid timeframe (must be 30d, 60d, or 90d)
- `405 Method Not Allowed`: Only GET allowed
- `500 Internal Server Error`: Database error

**Caching:**
- `Cache-Control: no-cache, no-store, must-revalidate` (No caching for real-time data)

---

## Endpoint 4: POST /api/testament/log

**Purpose**: Log new testament from Africa AI App (Internal)

**Authorization**: Requires `ORDA_INTERNAL_API_KEY`

### Request

```bash
POST /api/testament/log
Authorization: Bearer {ORDA_INTERNAL_API_KEY}
Content-Type: application/json
```

**Headers:**
- `Authorization` (required): Bearer token with API key
- `Content-Type`: application/json
- `CORS`: Enabled

**Request Body:**
```json
{
  "actorDid": "did:example:actor123",
  "timestamp": "2024-03-17T10:30:00Z",
  "gatesEvaluation": [
    {
      "gate": "identity_verification",
      "passed": true,
      "score": 95,
      "details": "Identity verified against trusted registry",
      "evaluatedAt": "2024-03-17T10:30:00Z",
      "evidence": "https://example.com/evidence"
    },
    {
      "gate": "credential_validation",
      "passed": true,
      "score": 92,
      "details": "Credentials validated"
    },
    {
      "gate": "hardware_security",
      "passed": true,
      "score": 88,
      "details": "HSM verified"
    },
    {
      "gate": "data_integrity",
      "passed": true,
      "score": 90,
      "details": "Data checksums verified"
    },
    {
      "gate": "audit_compliance",
      "passed": true,
      "score": 85,
      "details": "Audit trail complete"
    },
    {
      "gate": "governance_framework",
      "passed": true,
      "score": 87,
      "details": "Framework compliant"
    },
    {
      "gate": "regulatory_approval",
      "passed": true,
      "score": 89,
      "details": "Approval obtained"
    }
  ],
  "jurisdiction": "US",
  "nistCompliant": true
}
```

**Required Fields:**
- `actorDid` (string): DID of the acting entity
- `timestamp` (string): ISO 8601 timestamp
- `gatesEvaluation` (array): Exactly 7 gate evaluations
- Each gate requires: `gate`, `passed`, `score` (0-100), `details`

### Response

**Success (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "testament-789",
    "actor_did": "did:example:actor123",
    "timestamp": "2024-03-17T10:30:00Z",
    "is_active": true,
    "gates_evaluation": "[...]",
    "overall_score": 89,
    "jurisdiction": "US",
    "nist_compliant": true,
    "created_at": "2024-03-17T10:30:00Z",
    "updated_at": "2024-03-17T10:30:00Z"
  },
  "message": "Testament logged successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
  - Missing required fields
  - Not exactly 7 gates
  - Invalid gate type
  - Gate score not 0-100
  - Gate passed not boolean
- `401 Unauthorized`: Invalid or missing API key
- `405 Method Not Allowed`: Only POST allowed
- `500 Internal Server Error`: Database error

**Side Effects:**
- Inserts testament with all 7 gate evaluations
- Calculates overall compliance score (average of gate scores)
- Determines NIST compliance (all gates passed AND score >= 80)
- Updates identity testament count
- Logs request/response

---

## Endpoint 5: GET /api/compliance

**Purpose**: Generate NIST compliance proof for regulatory review

### Request

```bash
GET /api/compliance?testament_id=test-id
```

**Query Parameters:**
- `testament_id` (required, string): Testament ID

**Headers:**
- `CORS`: Enabled

### Response

**Success (200 OK)**
```json
{
  "success": true,
  "data": {
    "testamentId": "test-id",
    "nistAlignment": 95,
    "gatesEvaluated": 7,
    "gatesPassed": 7,
    "gatesFailed": 0,
    "hardwareVerified": true,
    "regulatoryReady": true,
    "jurisdiction": "US",
    "details": {
      "identity_verification": {
        "passed": true,
        "score": 95,
        "details": "Identity verified"
      },
      "credential_validation": {
        "passed": true,
        "score": 92,
        "details": "Credentials validated"
      },
      "hardware_security": {
        "passed": true,
        "score": 88,
        "details": "HSM verified"
      },
      "data_integrity": {
        "passed": true,
        "score": 90,
        "details": "Data checksums verified"
      },
      "audit_compliance": {
        "passed": true,
        "score": 85,
        "details": "Audit trail complete"
      },
      "governance_framework": {
        "passed": true,
        "score": 87,
        "details": "Framework compliant"
      },
      "regulatory_approval": {
        "passed": true,
        "score": 89,
        "details": "Approval obtained"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Testament ID is required
- `404 Not Found`: Testament not found
- `405 Method Not Allowed`: Only GET allowed
- `500 Internal Server Error`: Database error

**Caching:**
- `Cache-Control: public, max-age=31536000, immutable` (1 year)

---

## CORS Headers

All endpoints include the following CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

## Request/Response Logging

All requests are logged with the following format:
```json
{
  "timestamp": "2024-03-17T10:30:00Z",
  "method": "GET",
  "url": "/api/testament/test-id",
  "statusCode": 200,
  "duration": "45ms",
  "userAgent": "curl/7.64.1"
}
```

Errors are logged with additional error details.

## Error Handling

All endpoints follow a consistent error response format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Environment Configuration

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
ORDA_INTERNAL_API_KEY=<your-internal-api-key>  # Required for /api/testament/log
```

## Testing

Run the test script:
```bash
bash test-endpoints.sh
```

## TypeScript Types

All types are defined in `lib/types/index.ts`:
- `Testament`: Testament with gate evaluations
- `Identity`: Identity with metadata
- `MetricsBreakdown`: Aggregated metrics
- `ComplianceProof`: NIST compliance information
- `GateEvaluation`: Individual gate evaluation
- `ApiResponse<T>`: Standard response wrapper
- `PaginatedResponse<T>`: Paginated response wrapper

