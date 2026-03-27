# Environment Setup Guide

**Version:** 1.0  
**Last Updated:** 2026-03-27

## Overview

ORDA Registry requires environment variables for database, API, and deployment configuration. This guide covers local development, testing, and production deployment.

---

## 1. Local Development Setup

### Create `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (server-side only, DO NOT expose in browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ORDA API Configuration (optional for local testing)
ORDA_API_URL=https://api.orda-registry.org
ORDA_API_KEY=your-orda-api-key-here
ORDA_ENVIRONMENT=development

# Internal API Key (for POST /api/testament/log)
ORDA_INTERNAL_API_KEY=your-internal-api-key-here
```

### Create `.env.example` (for repository)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ORDA API Configuration
ORDA_API_URL=https://api.orda-registry.org
ORDA_API_KEY=your-api-key-here
ORDA_ENVIRONMENT=production

# Internal API Key
ORDA_INTERNAL_API_KEY=your-internal-key-here
```

### Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local from .env.example
cp .env.example .env.local

# 3. Add your credentials to .env.local
# - Edit with your actual Supabase credentials
# - Leave ORDA keys empty if you don't have access yet

# 4. Run development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

---

## 2. Environment Variables Reference

### Required Variables

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Type:** URL
- **Example:** `https://xxxxxxxxx.supabase.co`
- **Description:** Supabase project URL
- **Where to find:** Supabase Dashboard → Settings → API
- **Usage:** Public (exposed to browser)
- **Required:** Yes

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type:** String (JWT)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description:** Supabase anonymous key for client-side requests
- **Where to find:** Supabase Dashboard → Settings → API
- **Usage:** Public (exposed to browser)
- **Required:** Yes

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Type:** String (JWT)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description:** Supabase service role key for server-side requests
- **Where to find:** Supabase Dashboard → Settings → API
- **Usage:** Private (server-side only)
- **Required:** Yes (for API endpoints)
- **⚠️ WARNING:** Never expose this in browser code or version control

### Optional Variables

#### `ORDA_API_URL`
- **Type:** URL
- **Default:** `https://api.orda-registry.org`
- **Description:** ORDA API endpoint for testament anchoring
- **Usage:** Server-side API calls
- **Required:** Only if using ORDA integration
- **Example:** `https://api.orda-registry.org` or `https://sandbox.orda-registry.org`

#### `ORDA_API_KEY`
- **Type:** String
- **Description:** API key for ORDA service
- **Usage:** Server-side API authentication
- **Required:** Only if using ORDA integration
- **⚠️ WARNING:** Keep private, store in `.env.local` and GitHub secrets only

#### `ORDA_ENVIRONMENT`
- **Type:** String (development | production)
- **Default:** `production`
- **Description:** ORDA deployment environment
- **Usage:** Affects API behavior and logging
- **Required:** No

#### `ORDA_INTERNAL_API_KEY`
- **Type:** String
- **Description:** Key for internal `/api/testament/log` endpoint
- **Usage:** Server-side authentication
- **Required:** For internal testament logging
- **⚠️ WARNING:** Keep private, store in `.env.local` and GitHub secrets only

---

## 3. Supabase Setup

### Get Your Credentials

1. **Create Supabase account** (if needed)
   - Go to https://supabase.com
   - Sign up with email or GitHub

2. **Create or select a project**
   - Click "New Project"
   - Name: "orda-registry"
   - Database password: (auto-generated, save it)
   - Region: Choose closest to your users

3. **Find your credentials**
   - Go to Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `Anon (public)` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `Service role (secret)` → `SUPABASE_SERVICE_ROLE_KEY`

4. **Initialize database**
   ```bash
   # Option 1: Using SQL Editor in Supabase Dashboard
   - Go to SQL Editor
   - Click "New Query"
   - Paste contents of schema.sql
   - Click "Run"
   
   # Option 2: Using psql command
   psql postgresql://postgres:password@project.supabase.co:5432/postgres -f schema.sql
   ```

### Verify Setup

```bash
# Test connection
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/identities \
  -X GET
```

---

## 4. GitHub Secrets Setup

For Vercel deployment and CI/CD, add these secrets to GitHub:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add each secret:

```
NEXT_PUBLIC_SUPABASE_URL              (from Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY         (from Supabase)
SUPABASE_SERVICE_ROLE_KEY             (from Supabase)
ORDA_API_KEY                          (from ORDA team)
ORDA_INTERNAL_API_KEY                 (define your own)

# For Vercel deployment
VERCEL_TOKEN                          (from Vercel Settings)
VERCEL_ORG_ID                         (from Vercel)
VERCEL_PROJECT_ID                     (from Vercel)
```

### Get Vercel Secrets

1. **VERCEL_TOKEN**
   - Go to https://vercel.com/account/tokens
   - Click "Create"
   - Copy token → add to GitHub Secrets

2. **VERCEL_ORG_ID**
   - Go to https://vercel.com/teams
   - Click your team
   - Copy Organization ID from URL or settings

3. **VERCEL_PROJECT_ID**
   - Go to Vercel project settings
   - Copy Project ID

---

## 5. Production Deployment (Vercel)

### Initial Deployment

1. **Connect repository to Vercel**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Select "courtneybtaylor-sys/ORDA-REGISTRY"

2. **Configure environment**
   - Under "Environment Variables"
   - Add each secret:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     ORDA_INTERNAL_API_KEY
     ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

4. **Configure domains**
   - Add domain: `orda-registry.org`
   - Add domain: `www.orda-registry.org`
   - Update DNS records (see domain registrar)

### Environment-Specific Configuration

#### Production
```
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
ORDA_ENVIRONMENT=production
ORDA_API_URL=https://api.orda-registry.org
```

#### Preview/Staging
```
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
ORDA_ENVIRONMENT=staging
ORDA_API_URL=https://api-staging.orda-registry.org
```

#### Development
```
NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.co
ORDA_ENVIRONMENT=development
ORDA_API_URL=http://localhost:3001
```

---

## 6. Testing Environment

### Run Tests Locally

```bash
# Set environment variables
export ORDA_API_KEY=your-key-here
export ORDA_API_URL=https://api.orda-registry.org

# Run all tests
npm test

# Run integration tests only
npm run test:integration

# Run specific test
npm run test:orda
```

### Run Tests in GitHub Actions

GitHub Actions automatically sets environment variables from secrets:
- `.github/workflows/test.yml` uses `${{ secrets.ORDA_API_KEY }}`
- Tests only run if `ORDA_API_KEY` is set in GitHub Secrets
- Otherwise tests are skipped with a message

---

## 7. Security Best Practices

### Do's ✅
- Store private keys in `.env.local` (git-ignored)
- Use GitHub Secrets for CI/CD variables
- Rotate API keys regularly
- Use different keys for dev/staging/prod
- Log API key usage for audit trails
- Use HTTPS everywhere

### Don'ts ❌
- Never commit `.env.local` to git
- Never hardcode secrets in code
- Never share `.env.local` files
- Never use same key across environments
- Never expose service role keys to browser
- Never log sensitive values

### Key Rotation

If a key is compromised:

1. **Revoke the key**
   - Supabase: Settings → API → Regenerate key
   - ORDA: Contact team to rotate

2. **Update secrets**
   - Update `.env.local`
   - Update GitHub Secrets
   - Update Vercel Environment Variables

3. **Redeploy**
   ```bash
   # GitHub Actions will auto-deploy
   git push origin main
   ```

---

## 8. Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

**Cause:** Dependencies not installed or package.json incorrect

**Fix:**
```bash
npm install
npm run build
```

### "SUPABASE_SERVICE_ROLE_KEY not set"

**Cause:** Environment variable not configured

**Fix:**
```bash
# Add to .env.local
SUPABASE_SERVICE_ROLE_KEY=sk_test_...

# Or for Vercel
# Add to Project Settings → Environment Variables
```

### "ORDA_API_KEY environment variable is required"

**Cause:** Tests need ORDA credentials

**Fix:**
```bash
# For local testing
export ORDA_API_KEY=your-key
npm test

# For GitHub Actions
# Add ORDA_API_KEY to GitHub Secrets
```

### Build fails: "next: command not found"

**Cause:** `next` not installed or `package.json` build script wrong

**Fix:**
```bash
npm install
# Verify package.json has: "build": "next build"
npm run build
```

---

## 9. Verification Checklist

Before deployment:

- [ ] `.env.local` created with all required variables
- [ ] Can run `npm run dev` locally without errors
- [ ] Can run `npm run build` locally without errors
- [ ] Can run `npm test` locally (or skip with message)
- [ ] Supabase tables created via schema.sql
- [ ] GitHub Secrets configured for CI/CD
- [ ] Vercel project created and linked
- [ ] Vercel environment variables set
- [ ] Domain DNS configured (for production)

---

## 10. Quick Reference

### Install & Run Locally
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
open http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Run Tests
```bash
export ORDA_API_KEY=your-key
npm test
```

### Deploy to Vercel
```bash
git push origin main
# Vercel auto-deploys via GitHub Actions
```

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- ORDA Team: (contact information)
