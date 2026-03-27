# ORDA Registry Database Migration - Phase 1

## Status: Ready to Apply ✅

Your Supabase project is configured and ready. Follow these steps to create the database schema.

---

## Option A: Manual SQL Editor (Recommended - 2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/kpndhlnvjztclbkmawbz
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Execute Schema
1. Open: `schema.sql` from this repository (at the root)
2. Copy the entire file content
3. Paste into the Supabase SQL Editor
4. Click **Run** button (or Ctrl+Enter)
5. Wait for completion ✅

### Step 3: Verify Tables
In the SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should return:
- `identities`
- `testaments`
- `gate_evaluations`
- `metrics`
- `audit_log`

---

## Option B: Automated Script (Advanced)

If you prefer automated setup:

```bash
# Install dependencies (if not done)
npm install

# Run migration script
npx ts-node scripts/apply-schema.ts
```

This will:
1. Read `schema.sql`
2. Connect to your Supabase project
3. Execute all DDL statements
4. Verify tables exist
5. Log results

---

## What Gets Created

### Tables (5):
| Table | Purpose |
|-------|---------|
| `identities` | AI identity registry with DID as primary key |
| `testaments` | Immutable action records with signatures |
| `gate_evaluations` | Per-gate compliance results (G1-G7) |
| `metrics` | Hourly aggregated statistics |
| `audit_log` | Complete audit trail for compliance |

### Indexes (16):
- Foreign key indexes for performance
- Query field indexes for common filters
- Timestamp indexes for time-based lookups

### Views (4):
- `v_compliance_by_jurisdiction`
- `v_compliance_by_product`
- `v_gate_statistics`
- `v_identity_performance`

### Functions (2):
- `fn_update_identity_testament_count()` - Auto-updates counts
- `fn_update_hourly_metrics()` - Aggregates hourly metrics

### Row-Level Security:
- Public read access enabled
- Write policies ready for authentication

---

## Next: Phase 2 (API Routes)

Once schema is created, the API routes are ready:
- ✅ `POST /api/testament/log` - Record a testament
- ✅ `GET /api/testament/[id]` - Retrieve testament
- ✅ `GET /api/identities` - List identities
- ✅ `GET /api/compliance` - Compliance metrics
- ✅ `GET /api/metrics` - Registry metrics

---

## Troubleshooting

### If you get "Table already exists" error
- The tables already exist from a previous run
- This is safe to ignore - you can continue
- Or drop and recreate: `DROP TABLE IF EXISTS testaments CASCADE;` etc.

### If connection fails
- Check URL: `https://kpndhlnvjztclbkmawbz.supabase.co`
- Verify service role key is correct
- Check `.env.local` has credentials

### If verification queries fail
- Wait 30 seconds and try again
- Some indexes may still be building
- Refresh the Supabase dashboard

---

## Complete this phase to proceed to:
1. **Phase 2**: API routes (already implemented ✅)
2. **Phase 3**: GitHub secrets for CI/CD
3. **Phase 4**: Deploy to Vercel

---

**Estimated Time**: 2-5 minutes
**Status**: You are here ⬅️
**Next**: Report back once migration is complete
