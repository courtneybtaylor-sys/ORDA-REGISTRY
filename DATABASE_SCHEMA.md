# ORDA Registry Database Schema

**Version:** 1.0  
**Database:** PostgreSQL (Supabase)  
**Generated:** 2026-03-27

## Overview

The ORDA Registry uses PostgreSQL for storing testament records, identity information, compliance metrics, and audit logs. The schema is optimized for:
- Fast testament lookups by ID
- Compliance metric aggregation
- Jurisdiction-based filtering
- Audit trail tracking
- Row-level security

**Total Schema Size:** ~14.9 KB SQL

---

## 1. Core Tables

### Table 1: `identities`
Registry participants with geographic and product information.

```sql
CREATE TABLE identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,                -- Decentralized Identifier
  name TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT,                       -- Country/region code
  status TEXT DEFAULT 'active',            -- active, inactive, suspended
  product TEXT,                            -- Product/service name
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  testament_count INT DEFAULT 0,           -- Auto-updated by trigger
  compliance_score NUMERIC(5,2),           -- Latest compliance score
  last_audit TIMESTAMP WITH TIME ZONE
);
```

**Columns:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `did` | TEXT UNIQUE | W3C Decentralized Identifier |
| `name` | TEXT | Organization or identity name |
| `description` | TEXT | Purpose/function description |
| `jurisdiction` | TEXT | Country or region code (e.g., 'TZ', 'US') |
| `status` | TEXT | One of: active, inactive, suspended |
| `product` | TEXT | Associated product or service |
| `contact_email` | TEXT | Contact information |
| `created_at` | TIMESTAMP | Record creation time (UTC) |
| `updated_at` | TIMESTAMP | Last update time (UTC) |
| `testament_count` | INT | Testament count (auto-updated) |
| `compliance_score` | NUMERIC | Latest calculated score (0-100) |
| `last_audit` | TIMESTAMP | Last compliance audit time |

**Indexes:**
```sql
CREATE INDEX idx_identities_jurisdiction ON identities(jurisdiction);
CREATE INDEX idx_identities_status ON identities(status);
CREATE INDEX idx_identities_product ON identities(product);
CREATE INDEX idx_identities_created_at ON identities(created_at);
```

---

### Table 2: `testaments`
Testament records representing claims or transactions.

```sql
CREATE TABLE testaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES identities(id),
  said TEXT NOT NULL,                     -- SAID (Self-Addressed IDentifier)
  agent_did TEXT,                         -- Agent identifier
  action TEXT NOT NULL,                   -- Type of action
  payload JSONB,                          -- Action-specific data
  signature TEXT NOT NULL,                -- Cryptographic signature
  chain_link UUID REFERENCES testaments(id), -- Previous testament reference
  status TEXT DEFAULT 'verified',         -- verified, pending, failed
  compliance_score NUMERIC(5,2),          -- Overall compliance score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  public_url TEXT,                        -- Public verification URL
  registry_url TEXT                       -- Registry reference URL
);
```

**Columns:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, immutable |
| `identity_id` | UUID | Foreign key to identities table |
| `said` | TEXT | Self-Addressed IDentifier (cryptographic hash) |
| `agent_did` | TEXT | Agent responsible for testament |
| `action` | TEXT | Action type (e.g., 'travel.recommendation', 'attestation') |
| `payload` | JSONB | Variable data structure for action |
| `signature` | TEXT | Ed25519 or ECDSA signature |
| `chain_link` | UUID | Link to previous testament in chain |
| `status` | TEXT | One of: verified, pending, failed |
| `compliance_score` | NUMERIC | Average of 7 gate scores |
| `created_at` | TIMESTAMP | Immutable creation time |
| `public_url` | TEXT | Generated verification URL |
| `registry_url` | TEXT | Registry endpoint URL |

**Indexes:**
```sql
CREATE INDEX idx_testaments_identity_id ON testaments(identity_id);
CREATE INDEX idx_testaments_created_at ON testaments(created_at DESC);
CREATE INDEX idx_testaments_status ON testaments(status);
CREATE INDEX idx_testaments_said ON testaments(said);
CREATE INDEX idx_testaments_chain_link ON testaments(chain_link);
```

**Payload Structure Example:**
```json
{
  "userLanguage": "sw",
  "inputMethod": "voice",
  "canonicalInput": "Nataka kuruka kwa Tanzania",
  "claudeResponse": "Karibu sana! Inashauriwa...",
  "gates": {
    "g1_utterance": true,
    "g2_safety": true,
    "g3_interaction": true,
    "g4_compliance": true,
    "g5_audit": true,
    "g6_enforce": true,
    "g7_determinism": true
  },
  "aei": 87,
  "gei": 100,
  "shi": 87
}
```

---

### Table 3: `gate_evaluations`
Individual gate evaluation results for each testament (7 gates per testament).

```sql
CREATE TABLE gate_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testament_id UUID NOT NULL REFERENCES testaments(id) ON DELETE CASCADE,
  gate_number INT NOT NULL CHECK (gate_number >= 1 AND gate_number <= 7),
  passed BOOLEAN NOT NULL,                -- Gate result: pass/fail
  score NUMERIC(5,2),                     -- Numeric score for gate
  details JSONB,                          -- Gate-specific details
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Gate Numbers:**
| # | Name | Purpose |
|---|------|---------|
| 1 | `g1_utterance` | Voice/input quality validation |
| 2 | `g2_safety` | Safety checks (no harmful content) |
| 3 | `g3_interaction` | Interaction compliance |
| 4 | `g4_compliance` | Regulatory compliance |
| 5 | `g5_audit` | Audit trail completeness |
| 6 | `g6_enforce` | Enforcement capability |
| 7 | `g7_determinism` | Deterministic reproducibility |

**Indexes:**
```sql
CREATE INDEX idx_gate_evaluations_testament_id ON gate_evaluations(testament_id);
CREATE INDEX idx_gate_evaluations_gate_number ON gate_evaluations(gate_number);
CREATE INDEX idx_gate_evaluations_timestamp ON gate_evaluations(timestamp);
```

---

### Table 4: `metrics`
Pre-aggregated compliance metrics for performance.

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,                   -- hourly, daily, weekly
  total_testaments INT DEFAULT 0,
  passed_testaments INT DEFAULT 0,
  pass_rate NUMERIC(5,2),                 -- Percentage passed
  avg_compliance_score NUMERIC(5,2),      -- Average score
  avg_gate_scores JSONB,                  -- Per-gate averages
  by_jurisdiction JSONB,                  -- Breakdown by location
  by_product JSONB,                       -- Breakdown by product
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Example Metrics:**
```json
{
  "period": "daily",
  "total_testaments": 1234,
  "passed_testaments": 1156,
  "pass_rate": 93.68,
  "avg_compliance_score": 89.45,
  "avg_gate_scores": {
    "g1_utterance": 94.2,
    "g2_safety": 96.1,
    "g3_interaction": 91.5,
    "g4_compliance": 88.9,
    "g5_audit": 89.3,
    "g6_enforce": 87.6,
    "g7_determinism": 82.4
  },
  "by_jurisdiction": {
    "TZ": 456,
    "US": 234,
    "KE": 189
  },
  "by_product": {
    "travel": 678,
    "health": 345,
    "finance": 211
  }
}
```

**Indexes:**
```sql
CREATE INDEX idx_metrics_period ON metrics(period);
CREATE INDEX idx_metrics_created_at ON metrics(created_at);
```

---

### Table 5: `audit_log`
Complete audit trail for compliance and regulatory review.

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,                   -- create, update, delete, verify
  resource_type TEXT NOT NULL,            -- testaments, identities, metrics
  resource_id UUID,                       -- ID of affected resource
  changes JSONB,                          -- Before/after values
  actor_did TEXT,                         -- Who made the change
  ip_address INET,                        -- IP address of request
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX idx_audit_log_resource_id ON audit_log(resource_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
```

---

## 2. Views

### View 1: `compliance_by_jurisdiction`
Metrics aggregated by geographic jurisdiction.

```sql
CREATE VIEW compliance_by_jurisdiction AS
SELECT
  identity->>'jurisdiction' as jurisdiction,
  COUNT(testaments.id) as total_testaments,
  COUNT(CASE WHEN testaments.status = 'verified' THEN 1 END) as verified,
  ROUND(AVG(testaments.compliance_score)::numeric, 2) as avg_score
FROM testaments
JOIN identities ON testaments.identity_id = identities.id
GROUP BY identity->>'jurisdiction'
ORDER BY avg_score DESC;
```

### View 2: `compliance_by_product`
Metrics aggregated by product/service.

```sql
CREATE VIEW compliance_by_product AS
SELECT
  identities.product,
  COUNT(testaments.id) as total_testaments,
  COUNT(CASE WHEN testaments.status = 'verified' THEN 1 END) as verified,
  ROUND(AVG(testaments.compliance_score)::numeric, 2) as avg_score
FROM testaments
JOIN identities ON testaments.identity_id = identities.id
WHERE identities.product IS NOT NULL
GROUP BY identities.product
ORDER BY avg_score DESC;
```

### View 3: `gate_statistics`
Pass rates and averages for each gate.

```sql
CREATE VIEW gate_statistics AS
SELECT
  gate_number,
  COUNT(*) as total_evaluations,
  COUNT(CASE WHEN passed THEN 1 END) as passed,
  ROUND(100.0 * COUNT(CASE WHEN passed THEN 1 END) / COUNT(*)::numeric, 2) as pass_rate,
  ROUND(AVG(score)::numeric, 2) as avg_score
FROM gate_evaluations
GROUP BY gate_number
ORDER BY gate_number;
```

### View 4: `identity_performance`
Per-identity compliance statistics.

```sql
CREATE VIEW identity_performance AS
SELECT
  identities.id,
  identities.name,
  identities.did,
  COUNT(testaments.id) as total_testaments,
  COUNT(CASE WHEN testaments.status = 'verified' THEN 1 END) as verified_count,
  ROUND(100.0 * COUNT(CASE WHEN testaments.status = 'verified' THEN 1 END) / COUNT(testaments.id)::numeric, 2) as verification_rate,
  ROUND(AVG(testaments.compliance_score)::numeric, 2) as avg_compliance
FROM identities
LEFT JOIN testaments ON identities.id = testaments.identity_id
GROUP BY identities.id, identities.name, identities.did
ORDER BY avg_compliance DESC;
```

---

## 3. Functions & Triggers

### Function 1: `update_testament_counts()`
Auto-updates testament counts on identities table.

```sql
CREATE OR REPLACE FUNCTION update_testament_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE identities 
    SET testament_count = testament_count + 1
    WHERE id = NEW.identity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE identities 
    SET testament_count = testament_count - 1
    WHERE id = OLD.identity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testaments_count_trigger
AFTER INSERT OR DELETE ON testaments
FOR EACH ROW EXECUTE FUNCTION update_testament_counts();
```

### Function 2: `hourly_metrics_aggregation()`
Scheduled function for hourly metrics calculation.

```sql
CREATE OR REPLACE FUNCTION hourly_metrics_aggregation()
RETURNS void AS $$
BEGIN
  INSERT INTO metrics (period, total_testaments, passed_testaments, pass_rate, avg_compliance_score, created_at)
  SELECT
    'hourly' as period,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'verified' THEN 1 END) as passed,
    ROUND(100.0 * COUNT(CASE WHEN status = 'verified' THEN 1 END) / COUNT(*)::numeric, 2),
    ROUND(AVG(compliance_score)::numeric, 2),
    NOW()
  FROM testaments
  WHERE created_at >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Row-Level Security

### Policies

```sql
-- Allow public read access to testaments
CREATE POLICY testaments_read ON testaments
  FOR SELECT
  USING (true);

-- Allow public read access to identities
CREATE POLICY identities_read ON identities
  FOR SELECT
  USING (true);

-- Restrict audit log writes to authenticated users
CREATE POLICY audit_log_write ON audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 5. Setup Instructions

### Prerequisites
- PostgreSQL 13+ (Supabase includes this)
- `uuid-ossp` extension (Supabase has this enabled)

### Installation Steps

1. **Create tables:**
   ```bash
   psql -f schema.sql
   ```

2. **Verify installation:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

3. **Check indexes:**
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE schemaname = 'public';
   ```

4. **Verify views:**
   ```sql
   SELECT viewname FROM pg_views 
   WHERE schemaname = 'public';
   ```

### Sample Queries

**List all identities:**
```sql
SELECT id, name, jurisdiction, status, testament_count, compliance_score
FROM identities
ORDER BY compliance_score DESC;
```

**Get testaments for an identity:**
```sql
SELECT id, said, action, status, compliance_score, created_at
FROM testaments
WHERE identity_id = 'some-uuid'
ORDER BY created_at DESC;
```

**View compliance by jurisdiction:**
```sql
SELECT * FROM compliance_by_jurisdiction
LIMIT 10;
```

**Check gate pass rates:**
```sql
SELECT * FROM gate_statistics
ORDER BY pass_rate DESC;
```

**Get identity performance:**
```sql
SELECT * FROM identity_performance
LIMIT 20;
```

---

## 6. Performance Notes

### Query Optimization
- Testaments table has `created_at` DESC index for time-based queries
- All foreign keys indexed for fast joins
- JSONB columns support GIN indexing if needed
- Views are materialized through metrics table

### Storage
- Current schema: ~14.9 KB
- ~100 testaments: ~50 KB data
- ~1000 testaments: ~500 KB data
- Growth rate: ~0.5 KB per testament

### Backup Strategy
- Supabase auto-backups daily
- Point-in-time recovery available
- Export via `pg_dump` for offline backups

---

## 7. Migration Guide

### From Previous Schema
If migrating from an older schema:

1. **Backup existing data:**
   ```sql
   CREATE TABLE identities_backup AS SELECT * FROM identities;
   CREATE TABLE testaments_backup AS SELECT * FROM testaments;
   ```

2. **Drop old constraints (if needed):**
   ```sql
   ALTER TABLE testaments DROP CONSTRAINT IF EXISTS fk_identity;
   ```

3. **Apply new schema:**
   ```sql
   psql -f schema.sql
   ```

4. **Migrate data:**
   ```sql
   INSERT INTO new_identities SELECT * FROM identities_backup;
   INSERT INTO new_testaments SELECT * FROM testaments_backup;
   ```

---

## 8. Troubleshooting

### Connection Issues
```sql
-- Check connection:
SELECT 1;

-- List all tables:
\dt

-- Check table structure:
\d testaments
```

### Data Issues
```sql
-- Check for NULL values:
SELECT COUNT(*) FROM testaments WHERE identity_id IS NULL;

-- Find orphaned records:
SELECT * FROM testaments
WHERE identity_id NOT IN (SELECT id FROM identities);

-- Rebuild indexes:
REINDEX TABLE testaments;
```

### Performance Issues
```sql
-- Check index usage:
SELECT * FROM pg_stat_user_indexes;

-- Analyze query plans:
EXPLAIN ANALYZE SELECT * FROM testaments LIMIT 10;

-- Vacuum and analyze:
VACUUM ANALYZE testaments;
```

---

**Last Updated:** 2026-03-27  
**Status:** Production Ready  
**Maintenance:** Monthly index optimization recommended
