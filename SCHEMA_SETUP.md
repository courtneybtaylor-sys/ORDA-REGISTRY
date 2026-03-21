# ORDA Registry Database Schema Setup Guide

## Overview

This guide provides step-by-step instructions to set up the ORDA Registry PostgreSQL database schema on Supabase. The schema includes 5 core tables, comprehensive indexes, 4 compliance views, 2 auto-update functions, Row-Level Security (RLS) policies, and sample test data.

## Prerequisites

- Access to a Supabase project
- Supabase SQL Editor access
- PostgreSQL 12+ (Supabase default)

## Schema Components

### 1. Tables (5 total)

#### identities
- AI identity registry with DID as primary key
- Fields: `did`, `identity_type`, `product`, `jurisdiction`, `activation_date`, `gates_active`, `testaments_generated`, `compliance_score`, `status`, `last_active`
- Constraints: `identity_type` and `status` enums, `compliance_score` between 0-1

#### testaments
- Immutable action records with cryptographic proof
- Fields: `testament_id`, `timestamp`, `actor_did` (FK), `action_type`, `overall_score`, `hardware_signature`, `jurisdiction`, `nist_compliant`, `cryptographic_proof`, `user_explicit_consent`, `data_residency`, `product`
- Relations: References `identities.did` via `actor_did`

#### gate_evaluations
- Per-gate detail records (Gates 1-7)
- Fields: `testament_id` (FK), `gate_number`, `gate_name`, `passed`, `score`, `reason`
- Relations: References `testaments.testament_id` with CASCADE delete

#### metrics
- Hourly aggregated statistics
- Fields: `metric_hour`, `total_testaments`, `testaments_hour`, `avg_compliance`, `gates_passed_pct`, `jurisdictions_active`, `products_active`, `nist_aligned`
- Uniqueness: `metric_hour` is unique

#### audit_log
- Registry modification history
- Fields: `action`, `resource_type`, `resource_id`, `actor_id`, `details` (JSONB), `timestamp`

### 2. Indexes (16 total)

**Foreign Key Indexes:**
- `idx_testaments_actor_did` - Foreign key on actor_did
- `idx_gate_evaluations_testament_id` - Foreign key on testament_id

**Common Query Field Indexes:**
- Testaments: `timestamp`, `jurisdiction`, `product`, `action_type`, `nist_compliant`
- Identities: `jurisdiction`, `product`, `identity_type`, `status`
- Gate Evaluations: `gate_number`, `passed`
- Metrics: `metric_hour` (DESC for latest first)
- Audit Log: `timestamp` (DESC), resource lookup, actor lookup

### 3. Views (4 total)

1. **v_compliance_by_jurisdiction**
   - Groups testaments by jurisdiction
   - Shows: total count, unique identities, avg compliance score, NIST compliance %, product count

2. **v_compliance_by_product**
   - Groups testaments by product
   - Shows: total count, unique identities, avg compliance score, NIST compliance %, jurisdiction count

3. **v_gate_statistics**
   - Aggregates gate evaluation pass rates
   - Shows: pass rates per gate, avg gate score

4. **v_identity_performance**
   - Comprehensive identity metrics
   - Shows: recent 7-day testaments, average recent score, last testament timestamp

### 4. Functions (2 total)

1. **fn_update_identity_testament_count(actor_did TEXT)**
   - Auto-updates identity records with:
     - Total testament count
     - Count of gates where passed = true
     - last_active timestamp
   - Called after each testament creation

2. **fn_update_hourly_metrics()**
   - Calculates and upserts hourly metrics
   - Aggregates compliance data for the given hour
   - Called by scheduled job (recommended: hourly)

### 5. Row-Level Security (RLS)

**Policies:**
- All tables: Public read access enabled via `USING (true)` policies
- Future write/delete policies can be added based on authentication

## Execution Steps

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Execute the Schema

1. Open `schema.sql`
2. Copy the entire content
3. Paste into the Supabase SQL Editor
4. Click **Run** button (or Ctrl+Enter)

**Expected Output:**
```
Tables Created Successfully
[Table list showing: audit_log, gate_evaluations, identities, metrics, testaments]
Total Identities: 2
Total Testaments: 2
Total Gate Evaluations: 14
[Compliance data displayed]
```

### Step 3: Verify All Components

Execute these queries individually to verify:

```sql
-- 1. Verify tables exist
\dt

-- 2. Verify indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- 3. Verify views
SELECT * FROM information_schema.views WHERE table_schema = 'public';

-- 4. Verify functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- 5. Test sample data
SELECT * FROM public.v_compliance_by_jurisdiction;
SELECT * FROM public.v_identity_performance;

-- 6. Test RLS is enabled
SELECT tablename FROM pg_tables
WHERE tablename IN ('testaments', 'gate_evaluations', 'identities', 'metrics', 'audit_log')
AND NOT schemaname = 'pg_catalog';
```

## Sample Data

The schema includes pre-populated test data:

### Identities
- `did:example:agent:001` - Agent type, 95% compliance
- `did:example:consumer:001` - Consumer type, 87% compliance

### Testaments
- `testament:001` - Agent action, 95% overall score, 7/7 gates passed
- `testament:002` - Consumer action, 87% overall score, 7/7 gates passed

### Gate Evaluations
- 14 total evaluations (7 gates × 2 testaments)
- All gates passed with varying scores

## Common Operations

### Query Compliance by Jurisdiction
```sql
SELECT * FROM public.v_compliance_by_jurisdiction
ORDER BY avg_compliance_score DESC;
```

### Query Gate Statistics
```sql
SELECT * FROM public.v_gate_statistics
ORDER BY gate_number;
```

### Query Identity Performance
```sql
SELECT * FROM public.v_identity_performance
WHERE status = 'active'
ORDER BY compliance_score DESC;
```

### Update Identity Testament Count (after new testament)
```sql
SELECT public.fn_update_identity_testament_count('did:example:agent:001');
```

### Calculate Hourly Metrics (for scheduled jobs)
```sql
SELECT public.fn_update_hourly_metrics();
```

### Insert New Testament
```sql
INSERT INTO public.testaments (
  testament_id,
  actor_did,
  action_type,
  overall_score,
  jurisdiction,
  nist_compliant,
  cryptographic_proof,
  user_explicit_consent,
  product
) VALUES (
  'testament:003',
  'did:example:agent:001',
  'data_audit',
  0.92,
  'US',
  true,
  'proof_new123',
  true,
  'orda-core'
);

-- Then update identity counts
SELECT public.fn_update_identity_testament_count('did:example:agent:001');
```

## Data Dictionary

### Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| `testament_id` | TEXT | Primary key, unique |
| `actor_did` | TEXT | Foreign key to identities |
| `overall_score` | NUMERIC(3,2) | 0.00 to 1.00 |
| `compliance_score` | NUMERIC(3,2) | 0.00 to 1.00 |
| `identity_type` | TEXT | 'consumer', 'agent', 'enterprise' |
| `status` | TEXT | 'active', 'suspended', 'revoked' |
| `gate_number` | INTEGER | 1 to 7 |
| `jurisdiction` | TEXT | ISO 3166-1 alpha-2 codes |

### Timestamp Fields

All tables include:
- `created_at` - Set at INSERT
- `updated_at` - Set at INSERT and UPDATE
- Timezone aware (WITH TIME ZONE)

### Foreign Key Relationships

```
testaments.actor_did → identities.did (ON DELETE RESTRICT)
gate_evaluations.testament_id → testaments.testament_id (ON DELETE CASCADE)
```

## Troubleshooting

### Issue: "relation already exists"
**Solution:** Drop existing tables and views first:
```sql
DROP VIEW IF EXISTS public.v_identity_performance CASCADE;
DROP VIEW IF EXISTS public.v_gate_statistics CASCADE;
DROP VIEW IF EXISTS public.v_compliance_by_product CASCADE;
DROP VIEW IF EXISTS public.v_compliance_by_jurisdiction CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.metrics CASCADE;
DROP TABLE IF EXISTS public.gate_evaluations CASCADE;
DROP TABLE IF EXISTS public.testaments CASCADE;
DROP TABLE IF EXISTS public.identities CASCADE;
DROP FUNCTION IF EXISTS public.fn_update_hourly_metrics() CASCADE;
DROP FUNCTION IF EXISTS public.fn_update_identity_testament_count(TEXT) CASCADE;
```

Then re-run the schema creation.

### Issue: "foreign key constraint failed"
**Solution:** Ensure identities are created before testaments:
- The schema does this in correct order
- Check sample data section if manually inserting

### Issue: RLS policies blocking queries
**Solution:** RLS is enabled with public read access. For authenticated operations:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'testaments';

-- Add authenticated write policy (example)
CREATE POLICY "Enable authenticated write on testaments" ON public.testaments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Performance Optimization Notes

1. **Indexes**: All foreign keys and common query fields are indexed
2. **Views**: Use materialized views if querying large historical data
3. **Metrics**: Consider archiving old metrics to maintain performance
4. **Audit Log**: Partition by timestamp for large-scale deployments
5. **Functions**: Can be scheduled via pg_cron extension if available

## Next Steps

1. ✅ Execute schema.sql in Supabase SQL Editor
2. ✅ Verify all tables and views are accessible
3. ✅ Test sample data queries
4. ✅ Configure authentication and update RLS policies as needed
5. ✅ Set up scheduled job for `fn_update_hourly_metrics()` (every hour)
6. ✅ Begin populating production data
7. ✅ Monitor compliance metrics and audit logs

## Security Considerations

- **RLS**: Currently allows public read. Add authentication policies for writes
- **Audit Log**: Captures all modifications. Review regularly
- **Data Residency**: Stored in testament for compliance validation
- **NIST Compliance**: Tracked and reported in metrics
- **Cryptographic Proof**: Essential for testament integrity

## Backups

Supabase automatically backs up your database. Manual backups can be created via:
- Supabase Dashboard → Backups
- Or via CLI: `supabase db dump`

## Support

For issues with:
- **Schema**: Check SCHEMA_SETUP.md troubleshooting
- **Supabase**: Visit https://supabase.com/docs
- **PostgreSQL**: Visit https://www.postgresql.org/docs/
