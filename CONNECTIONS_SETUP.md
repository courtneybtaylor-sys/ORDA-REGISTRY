# Complete Connections Setup Guide

**Version:** 1.0
**Date:** March 27, 2026
**Status:** Production Ready

---

## Overview

This guide ensures all connections between the SAID-AIoT database, Supabase, GitHub, Vercel, and ORDA services are properly configured for seamless integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                         │
│                      (Next.js on Vercel)                        │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴─────────────────────────────────────────────────────┐
    ├──────────────────────────────────────────────────────────┤
    ▼                      ▼                      ▼              ▼
┌────────┐          ┌──────────┐          ┌────────────┐  ┌────────┐
│Supabase│          │ GitHub   │          │   Vercel   │  │  ORDA  │
│Database│          │  Secrets │          │ Deployment │  │  API   │
│        │          │   CI/CD  │          │  & Preview │  │        │
└────────┘          └──────────┘          └────────────┘  └────────┘
     │                    │                      │             │
     └────────────────────┴──────────────────────┴─────────────┘
             All connections documented below
```

---

## 1. Supabase Connection

### Prerequisites
- Supabase account: https://supabase.com
- PostgreSQL database created

### Setup Steps

#### 1.1 Get Supabase Credentials

1. Log in to Supabase dashboard
2. Select your project
3. Go to **Settings → API**
4. Copy these three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

#### 1.2 Update Environment

```bash
# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
EOF
```

#### 1.3 Apply Database Schema

```bash
# Install dependencies
npm install

# Apply SAID-AIoT v1.0 schema
npx ts-node scripts/apply-said-aiot-schema.ts

# Verify in Supabase SQL Editor
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
```

#### 1.4 Verify Connection

```bash
# Test query
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/operators \
  -X GET

# Should return: []
```

### Supabase Features Enabled
- [x] Row Level Security (RLS)
- [x] Realtime subscriptions
- [x] PostGIS (if enabled)
- [x] pgvector (if enabled)
- [x] Audit logging

---

## 2. GitHub Connection

### Prerequisites
- GitHub account with push access to `courtneybtaylor-sys/ORDA-REGISTRY`
- GitHub Fine-grained Personal Access Token

### Setup Steps

#### 2.1 Create GitHub Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

Create these secrets:

| Secret Name | Value | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API |
| `ORDA_API_KEY` | Provided by ORDA team | ORDA team |
| `ORDA_INTERNAL_API_KEY` | Generate your own | `openssl rand -hex 32` |
| `VERCEL_TOKEN` | From Vercel | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | From Vercel | Vercel → Settings |
| `VERCEL_PROJECT_ID` | From Vercel | Vercel → Project Settings |

#### 2.2 Configure CI/CD

Workflows are pre-configured in `.github/workflows/`:

**test.yml** - Runs on every push and PR:
- ✅ Installs dependencies
- ✅ Runs linter
- ✅ Type checking with TypeScript
- ✅ Builds application
- ✅ Runs integration tests (if ORDA_API_KEY set)

**deploy.yml** - Runs after successful test on main:
- ✅ Deploys to Vercel
- ✅ Sets environment variables
- ✅ Comments on PRs with deployment URL

#### 2.3 Enable Branch Protection (Optional)

For production safety:

1. Go to **Settings → Branches**
2. Add rule for `main` branch:
   - ✅ Require status checks to pass
   - ✅ Require code reviews before merging
   - ✅ Require branches to be up to date

---

## 3. Vercel Connection

### Prerequisites
- Vercel account: https://vercel.com
- Project created in Vercel

### Setup Steps

#### 3.1 Create Vercel Project

1. Log in to Vercel
2. Click **Add New → Project**
3. Select GitHub repository: `courtneybtaylor-sys/ORDA-REGISTRY`
4. Framework: **Next.js**
5. Root directory: **`./`** (default)
6. Click **Deploy**

#### 3.2 Configure Environment Variables in Vercel

In Vercel Project Settings → **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL          (Production)
NEXT_PUBLIC_SUPABASE_ANON_KEY     (Production)
SUPABASE_SERVICE_ROLE_KEY         (Production, not exposed to browser)
ORDA_INTERNAL_API_KEY             (Production)
SAID_AIOT_ENVIRONMENT             (production)
```

**Important:** Mark `SUPABASE_SERVICE_ROLE_KEY` as **secret** (encrypted).

#### 3.3 Configure Domains

In Vercel → **Domains**:

```
orda-registry.org          (Primary)
www.orda-registry.org      (Alias)
```

Update DNS records at your registrar.

#### 3.4 Enable Analytics & Monitoring

- [x] Web Analytics enabled
- [x] Speed Insights enabled
- [x] Error tracking enabled
- [x] Slack notifications for deployments

---

## 4. ORDA Integration

### Prerequisites
- ORDA API key from ORDA team
- ORDA account or sandbox access

### Setup Steps

#### 4.1 Get ORDA Credentials

Contact ORDA team to receive:
- `ORDA_API_KEY` - For testament anchoring
- `ORDA_API_URL` - Endpoint (production or sandbox)
- `ORDA_VERIFY_URL` - Verification endpoint

#### 4.2 Update Secrets

Add to GitHub Secrets:
```
ORDA_API_KEY=sk_...
ORDA_API_URL=https://api.orda-registry.org
```

#### 4.3 Test Connection

```bash
# Set environment variable
export ORDA_API_KEY=sk_...

# Run integration test
npm run test:integration

# Or test endpoint directly
curl -X POST https://api.orda-registry.org/testament/anchor \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{"testament_id": "test-123"}'
```

#### 4.4 API Endpoints

Configure in your application:

```typescript
// lib/orda.ts
const ORDA_API_URL = process.env.ORDA_API_URL || 'https://api.orda-registry.org';
const ORDA_API_KEY = process.env.ORDA_API_KEY;

export async function anchorTestament(testament) {
  const response = await fetch(`${ORDA_API_URL}/testament/anchor`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ORDA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testament)
  });
  return response.json();
}
```

---

## 5. End-to-End Testing

### Test Database → Supabase

```bash
# 1. Create .env.local with Supabase credentials
# 2. Run setup
npm install
npx ts-node scripts/apply-said-aiot-schema.ts

# 3. Verify tables
curl -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "https://your-project.supabase.co/rest/v1/operators" -X GET
```

### Test GitHub → Vercel

```bash
# 1. Create feature branch
git checkout -b test/connections

# 2. Make a small change
echo "# Test commit" >> README.md

# 3. Push to GitHub
git add . && git commit -m "test: verify CI/CD pipeline"
git push -u origin test/connections

# 4. Watch GitHub Actions run
# Go to: GitHub → Actions → Latest workflow

# 5. Check Vercel deployment
# Go to: Vercel → Deployments → Latest build
```

### Test ORDA Integration

```bash
# 1. Create test testament
curl -X POST http://localhost:3000/api/testament/log \
  -H "Authorization: Bearer YOUR_INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_did": "did:said:agent:test",
    "action_type": "data_access",
    "action_hash": "abc123..."
  }'

# 2. Verify it's stored in Supabase
SELECT * FROM testaments WHERE agent_did = 'did:said:agent:test';

# 3. Check ORDA anchoring
# (If ORDA_API_KEY is set, testament should be anchored)
```

---

## 6. Monitoring & Debugging

### Supabase Monitoring

**URL:** https://supabase.com/dashboard

- **Database → Logs** - SQL query logs
- **SQL Editor** - Run queries directly
- **Replication** - Monitor replication status
- **Backups** - Automatic daily backups

### GitHub Monitoring

**URL:** https://github.com/courtneybtaylor-sys/ORDA-REGISTRY/actions

- View workflow runs
- Check for failures
- Review logs for each step

### Vercel Monitoring

**URL:** https://vercel.com/dashboard

- **Deployments** - See all deployments
- **Analytics** - Page load times
- **Speed Insights** - Core Web Vitals
- **Error Tracking** - Application errors

### Application Monitoring

```bash
# View logs in Vercel
vercel logs

# Or tail logs from Supabase
# Settings → Logs → Database
```

---

## 7. Security Checklist

- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to browser
- [ ] All secrets stored only in GitHub Secrets & Vercel Environment Variables
- [ ] HTTPS enforced everywhere
- [ ] RLS policies enabled on sensitive tables
- [ ] API keys rotated regularly (every 90 days)
- [ ] Audit logs monitored for suspicious activity
- [ ] Backup strategy in place (Supabase auto-backups + manual exports)

---

## 8. Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is undefined"

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Make sure .env.local exists
ls -la .env.local

# Or set directly
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
npm run dev
```

### "Deployment failed on Vercel"

**Check:**
1. Go to Vercel → Deployments → Click failing deployment
2. Check Build Logs for specific error
3. Verify all secrets are set: Project Settings → Environment Variables
4. Test build locally: `npm run build`

### "GitHub Actions failing"

**Check:**
1. Go to GitHub → Actions → Click failing workflow
2. Click the job to see detailed logs
3. Look for missing secrets or failing tests
4. Common issues:
   - Missing `NEXT_PUBLIC_SUPABASE_URL` → Add to GitHub Secrets
   - TypeScript errors → Run `npx tsc --noEmit` locally
   - Build errors → Run `npm run build` locally

### "ORDA API returns 401 Unauthorized"

**Check:**
1. Verify `ORDA_API_KEY` is set: `echo $ORDA_API_KEY`
2. Check token hasn't expired
3. Verify API endpoint is correct: `ORDA_API_URL`
4. Review ORDA API documentation

---

## 9. Deployment Workflow

```
┌─────────────────────────────────────────────────────┐
│ 1. Developer makes changes                          │
│    (on feature branch: claude/setup-database-...)   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. Push to GitHub                                   │
│    git push origin feature-branch                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. GitHub Actions runs (test.yml)                   │
│    - Install deps                                   │
│    - Lint & type check                              │
│    - Build                                          │
│    - Run tests                                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Checks pass? ✓     │
        └──────────────────────┘
              /         \
           yes           no
          /               \
         ▼                 ▼
    Merge PR        Request changes
    (if approved)
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ 4. Push to main                                     │
│    (PR merged)                                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 5. GitHub Actions runs (deploy.yml)                 │
│    - Wait for test.yml to complete                  │
│    - Deploy to Vercel                               │
│    - Set environment variables                      │
│    - Build & deploy to production                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 6. Vercel deployment                                │
│    - Build (using npm run build)                    │
│    - Deploy to edge/serverless                      │
│    - Assign URL (vercel.app or custom domain)       │
│    - Run health checks                              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 7. Application live!                                │
│    https://orda-registry.vercel.app                 │
│    (or your custom domain)                          │
└─────────────────────────────────────────────────────┘
```

---

## 10. Next Steps

1. **Complete Setup:**
   - [ ] Configure Supabase (get credentials, apply schema)
   - [ ] Add GitHub secrets
   - [ ] Create Vercel project & add environment variables
   - [ ] Add ORDA credentials (if available)

2. **Run Tests:**
   ```bash
   npm install
   npm run build
   npm test
   ```

3. **Deploy:**
   ```bash
   git push origin main
   ```

4. **Monitor:**
   - Check GitHub Actions
   - Watch Vercel deployment
   - Monitor Supabase dashboard

---

## Quick Reference Commands

```bash
# Local development
npm install
npm run dev

# Test locally
npm run build
npm test
npm run test:integration

# Deploy to GitHub
git checkout -b feature/your-feature
git add .
git commit -m "feat: your feature"
git push -u origin feature/your-feature

# Create PR and merge
# (GitHub Actions will run tests)
# (Vercel will auto-deploy on merge to main)

# Check deployment
vercel logs
```

---

**Estimated Time:** 30-60 minutes for complete setup

**Questions?** Open an issue on GitHub or contact the ORDA team.
