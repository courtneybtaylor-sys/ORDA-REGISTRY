# SAID-AIoT Database Schema v1.0 Setup Guide

**Version:** 1.0
**Last Updated:** March 27, 2026
**Status:** Ready for Production

---

## Overview

This guide covers the complete setup of the SAID-AIoT v1.0 database schema, which implements a comprehensive system for AI agent identity management, capability governance, immutable action records (testaments), and provider data management.

### Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│ Layer 5: PROVIDER DATA                              │
│ (Travel, Services, Africa AI App)                   │
├─────────────────────────────────────────────────────┤
│ Layer 4: MA'AT ENGINE                               │
│ (Governance, Audit, Confidence Scoring)             │
├─────────────────────────────────────────────────────┤
│ Layer 3: TESTAMENT                                  │
│ (Immutable Action Records)                          │
├─────────────────────────────────────────────────────┤
│ Layer 2: CAPABILITY & AUTHORITY                     │
│ (Passports, Scope, Exclusions)                      │
├─────────────────────────────────────────────────────┤
│ Layer 1: IDENTITY LAYER (DID Registry)              │
│ (Operators, Agents, Devices)                        │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start (5 minutes)

### Prerequisites

1. Supabase account and project
2. Node.js 18+ and npm
3. GitHub repository access
4. Vercel account (optional, for deployment)

### Step 1: Set Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your Supabase credentials
# Required:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

### Step 2: Apply the Schema

```bash
# Option A: Automated (Recommended)
npm install
npx ts-node scripts/apply-said-aiot-schema.ts

# Option B: Manual (SQL Editor)
# 1. Open https://supabase.com/dashboard
# 2. SQL Editor → New Query
# 3. Copy contents of migrations/001_said_aiot_schema_v1.0.sql
# 4. Click Run
```

### Step 3: Verify Setup

```bash
# Check tables exist
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/operators \
  -X GET

# Expected response: [] (empty array, but table exists)
```

---

## Detailed Schema Documentation

### Layer 1: Identity Layer (DID Registry)

Manages decentralized identifiers (DIDs) for all actors in the system.

#### Table: `operators`
Organizations or entities running AI agents.

```sql
-- Fields
id                 UUID PRIMARY KEY
operator_did       TEXT UNIQUE      -- did:said:operator:...
legal_name         TEXT             -- Organization name
jurisdiction       TEXT[]           -- ['US', 'EU']
created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ

-- Indexes
idx_operators_did  (operator_did)
```

**Example:**
```sql
INSERT INTO operators (operator_did, legal_name, jurisdiction)
VALUES ('did:said:operator:acme', 'ACME Corp', ARRAY['US', 'EU']);
```

#### Table: `agents`
AI agents operated by organizations.

```sql
-- Fields
id                 UUID PRIMARY KEY
agent_did          TEXT UNIQUE      -- did:said:agent:...
operator_id        UUID FK          -- → operators(id)
version            TEXT             -- Semantic version
model_name         TEXT             -- Model identifier
status             TEXT             -- active | dissolved
dissolved_at       TIMESTAMPTZ      -- When agent was dissolved
created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ

-- Indexes
idx_agents_operator      (operator_id)
idx_agents_status        (status)
idx_agents_did           (agent_did)
```

#### Table: `devices`
Hardware/compute nodes where agents run.

```sql
-- Fields
id                 UUID PRIMARY KEY
device_did         TEXT UNIQUE      -- did:said:device:...
secure_element_id  TEXT UNIQUE      -- Hardware identifier
public_key         TEXT             -- PEM-encoded public key
device_type        TEXT             -- hardware | cloud | edge
created_at         TIMESTAMPTZ

-- Indexes
idx_devices_did         (device_did)
```

---

### Layer 2: Capability & Authority

Manages what agents are authorized to do.

#### Table: `capability_passports`
Credentials granting agents specific capabilities.

```sql
-- Fields
id                 UUID PRIMARY KEY
passport_id        TEXT UNIQUE      -- cred:said:...
agent_did          TEXT             -- Which agent
operator_did       TEXT             -- Which operator
issued_at          TIMESTAMPTZ      -- Issuance date
expires_at         TIMESTAMPTZ      -- Expiration (NULL = never)
scope              TEXT[]           -- ['loan_underwriting', 'risk_assessment']
excluded           TEXT[]           -- ['rate_policy_change']
human_in_loop      JSONB            -- {required_before: ['final_denial_over_500k']}
jurisdiction       TEXT[]           -- Valid jurisdictions
revoked            BOOLEAN          -- Revocation status
revoked_at         TIMESTAMPTZ      -- When revoked
signature          TEXT             -- Cryptographic signature
created_at         TIMESTAMPTZ

-- Indexes
idx_passports_agent          (agent_did)
idx_passports_operator       (operator_did)
idx_passports_expires        (expires_at)
idx_passports_revoked        (revoked)
```

**Example:**
```sql
INSERT INTO capability_passports (
  passport_id, agent_did, operator_did, issued_at, scope, jurisdiction
) VALUES (
  'cred:said:passport:1',
  'did:said:agent:alpha',
  'did:said:operator:acme',
  NOW(),
  ARRAY['data_analysis', 'decision_support'],
  ARRAY['US']
);
```

---

### Layer 3: Testament (Action Records)

Immutable records of all actions taken by agents.

#### Table: `testaments`
Complete audit trail of agent actions with cryptographic proofs.

```sql
-- Fields
id                 UUID PRIMARY KEY
testament_id       TEXT UNIQUE      -- uuid-v4 identifier
agent_did          TEXT             -- Which agent performed action
device_did         TEXT             -- Which device executed
operator_did       TEXT             -- Which operator
passport_id        TEXT             -- Capability used
action_type        TEXT             -- data_access | decision | audit_query | etc.
action_hash        TEXT             -- sha256(action_payload)
output_hash        TEXT             -- sha256(output_payload)
gate_results       JSONB            -- {G1: pass, G2: pass, ..., G7: stamp}
timestamp          TIMESTAMPTZ      -- When action occurred
se_signature       TEXT             -- Secure Element signature
jurisdiction       TEXT[]           -- Valid jurisdictions
spatial_context    JSONB            -- {latitude, longitude, altitude}
anchored_at        TEXT             -- Registry anchor (default: registry.said.dev)
dissolution_status TEXT             -- Status of dissolution if applicable
created_at         TIMESTAMPTZ

-- Indexes
idx_testaments_agent            (agent_did)
idx_testaments_device           (device_did)
idx_testaments_operator         (operator_did)
idx_testaments_timestamp        (timestamp DESC)
idx_testaments_action_type      (action_type)
idx_testaments_id               (testament_id)
```

**Example:**
```sql
INSERT INTO testaments (
  testament_id, agent_did, device_did, operator_did,
  action_type, action_hash, output_hash, gate_results,
  timestamp, se_signature
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'did:said:agent:alpha',
  'did:said:device:node1',
  'did:said:operator:acme',
  'loan_decision',
  'abc123...',
  'def456...',
  '{"G1": "pass", "G2": "pass", "G3": "conditional"}'::jsonb,
  NOW(),
  'sig_xyz...'
);
```

---

### Layer 4: Ma'at Engine (Governance & Audit)

Confidence scoring, source reliability, and audit logging.

#### Table: `decree_audit_logs`
Decision logs from Ma'at confidence engine.

```sql
-- Fields
id                      UUID PRIMARY KEY
user_id                 UUID             -- Requester (nullable for unauthenticated)
query                   TEXT             -- Original query
destination             VARCHAR(2)       -- Country code
intent                  VARCHAR(50)      -- visa_check | availability_check | etc.
gate_approved           BOOLEAN          -- Was request approved?
gate_confidence         DECIMAL(3,2)     -- 0.0-1.0
gate_signals            JSONB            -- Individual gate signals
gate_heartbeat_results  JSONB            -- Real-time source status
total_confidence_score  DECIMAL(3,2)     -- Overall confidence 0.0-1.0
source_quality_avg      DECIMAL(3,2)     -- Average source quality
recency_bonus           DECIMAL(3,2)     -- Bonus for recent data
conflict_penalty        DECIMAL(3,2)     -- Penalty for conflicting sources
confidence_breakdown    JSONB            -- Detailed scoring breakdown
agent_count             INT              -- Number of agents involved
processing_time_ms      INT              -- Execution time
formula_version         VARCHAR(10)      -- Confidence formula version
created_at              TIMESTAMPTZ

-- Indexes
idx_decree_user              (user_id, created_at)
idx_decree_destination       (destination)
idx_decree_confidence        (total_confidence_score)
idx_decree_created           (created_at DESC)
```

#### Table: `source_reliability`
Trust weights for data sources.

```sql
-- Fields
id                 UUID PRIMARY KEY
source_name        VARCHAR(255)     -- e.g., "Ghana Immigration Service"
source_type        VARCHAR(20)      -- government | partner_api | community | aggregator
weight             DECIMAL(3,2)     -- 0.0-1.0 confidence weight
effective_date     DATE             -- When weight becomes active
notes              TEXT             -- Context/metadata
created_at         TIMESTAMPTZ

-- Indexes
idx_source               (source_name, effective_date)
```

**Seed Data:**
```
Ghana Immigration Service      government  1.00
Kenya eVisa Portal            government  1.00
South Africa Home Affairs     government  1.00
Partner API                   partner_api 0.90
Community Report              community   0.70
Third-party Aggregator        aggregator  0.60
```

---

### Layer 5: Provider Data

Travel and service provider information.

#### Table: `providers`
Service providers (airlines, hotels, tour operators).

```sql
-- Fields
id                 UUID PRIMARY KEY
provider_name      TEXT             -- Company name
destination_code   VARCHAR(2)       -- ISO country code
status             TEXT             -- ACTIVE | VERIFIED | SUSPENDED
provider_type      TEXT             -- airline | hotel | tour_operator
contact_info       JSONB            -- {email, phone, website}
metadata           JSONB            -- Custom fields
created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ

-- Indexes
idx_providers_destination      (destination_code, status)
idx_providers_status           (status)
```

#### Table: `provider_scores`
Reliability metrics for providers.

```sql
-- Fields
id                 UUID PRIMARY KEY
provider_id        UUID FK          -- → providers(id) ON DELETE CASCADE
overall            DECIMAL(3,2)     -- Composite score
reliability        DECIMAL(3,2)     -- Service reliability
compliance         DECIMAL(3,2)     -- Regulatory compliance
user_satisfaction  DECIMAL(3,2)     -- User ratings
calculated_at      TIMESTAMPTZ

-- Indexes
idx_provider_scores          (provider_id, calculated_at DESC)
```

#### Table: `provider_data_updates`
Audit trail of data freshness.

```sql
-- Fields
id                 UUID PRIMARY KEY
destination        VARCHAR(2)       -- Country code
timestamp          TIMESTAMPTZ      -- Update time
update_type        TEXT             -- visa | pricing | availability
metadata           JSONB            -- Details of update
created_at         TIMESTAMPTZ

-- Indexes
idx_destination_timestamp    (destination, timestamp DESC)
```

---

## Row Level Security (RLS)

The schema includes RLS policies for fine-grained access control:

### Public Read Access
- `testaments` - Anyone can verify actions
- `gate_evaluations` - Anyone can see gate results
- `identities` - Anyone can look up identities

### Authenticated Access
- `decree_audit_logs` - Users see only their own queries
- `capability_passports` - Operators manage their own passports

---

## Integration with Supabase, GitHub, and Vercel

### Supabase Integration

**Environment Variables Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**API Endpoints:**
```
POST   /api/testament/log      - Record a testament
GET    /api/testament/:id      - Retrieve testament
GET    /api/operators          - List operators
GET    /api/agents             - List agents
GET    /api/decree/check       - Confidence check
```

### GitHub Integration

**Secrets to Configure:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ORDA_API_KEY
ORDA_INTERNAL_API_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

**CI/CD Pipeline:** `.github/workflows/` contains:
- Tests on PR
- Build verification
- Deployment to Vercel

### Vercel Integration

**Build Configuration:**
```bash
npm install
npm run build
npm start
```

**Environment:** Set secrets in Vercel Project Settings → Environment Variables

---

## Verification Checklist

Before going to production:

- [ ] Schema created in Supabase
- [ ] All 10 tables visible in SQL Editor
- [ ] All 16 indexes created
- [ ] RLS policies enabled
- [ ] Seed data (source_reliability) inserted
- [ ] Test queries return expected results
- [ ] GitHub secrets configured
- [ ] Vercel project linked and deployed
- [ ] API endpoints tested (curl or Postman)
- [ ] Monitoring and logging enabled

---

## Troubleshooting

### Schema Creation Fails

**Problem:** "Error: relation already exists"
```bash
# Safe to ignore - tables exist
# Or drop and recreate:
npx ts-node scripts/apply-said-aiot-schema.ts --force
```

### Supabase Connection Fails

**Problem:** "Error: Invalid API URL"
```bash
# Verify credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Check .env.local exists and has correct values
cat .env.local
```

### RLS Policy Errors

**Problem:** "new row violates row-level security policy"
```sql
-- Verify user is authenticated
SELECT auth.uid();

-- Check policy conditions
SELECT * FROM pg_policies WHERE tablename = 'testaments';
```

### API Endpoints Return 401

**Problem:** "Unauthorized: Missing or invalid token"
```bash
# Verify SUPABASE_SERVICE_ROLE_KEY is set (server-side only)
# Or use NEXT_PUBLIC_SUPABASE_ANON_KEY (client-side)
# Never expose service role key to browser
```

---

## Next Steps

1. **Test Integration:** Run integration tests
   ```bash
   npm run test:integration
   ```

2. **Deploy to Vercel:** Push to main branch
   ```bash
   git push origin main
   ```

3. **Monitor:** Check Vercel logs and Supabase metrics dashboard

4. **Scale:** Enable point-in-time recovery and backups in Supabase

---

## Documentation References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SAID-AIoT Whitepaper](https://registry.said.dev)
- [DID Specification](https://www.w3.org/TR/did-core/)

---

**Questions?** Contact the ORDA team or open an issue on GitHub.
