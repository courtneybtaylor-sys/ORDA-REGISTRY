# ORDA Integration Deployment Guide

## Critical Requirements

This document outlines the deployment process for real ORDA integration with public verification. This is required for the NIST submission (April 2 deadline).

**Key Milestone:** March 18 Launch with 240+ publicly verifiable testaments

## Phase 1: Get ORDA API Credentials (15 minutes)

### Step 1.1: Contact ORDA Team
```bash
# Obtain:
# - ORDA_API_URL (e.g., https://api.orda-registry.org)
# - ORDA_API_KEY (authentication token)
# - ORDA_VERIFY_URL (public verification endpoint)
```

### Step 1.2: Configure Environment Variables

```bash
# Copy the template
cp .env.example .env.production

# Add your credentials
export ORDA_API_URL="https://api.orda-registry.org"
export ORDA_API_KEY="your-api-key-here"
export ORDA_VERIFY_URL="https://verify.orda-registry.org"

# Verify in .env.production
cat .env.production
```

## Phase 2: Install Dependencies (10 minutes)

```bash
npm install
```

## Phase 3: Run Live ORDA Tests (30 minutes)

### Test 1: ORDA API Connectivity

```bash
# Test real API calls
npm run test -- __tests__/integration/orda-live-api.test.ts

# Expected Output:
# ✅ ORDA Live API Integration
#   ✅ should anchor a test testament to ORDA and return valid public URL
#   ✅ should handle ORDA API errors gracefully
#   ✅ should support batch anchoring (multiple testaments)
#   ✅ should generate a valid public verification URL
#   ✅ should verify that public URL returns 200 status
#   ✅ should return valid Merkle proof for testament
#   ✅ should link successive testaments in a chain
```

### Test 2: Schema Validation

```bash
npm run test -- __tests__/integration/orda-schema-validation.test.ts

# Expected Output:
# ✅ ORDA Registry Schema Validation
#   ✅ should validate testament schema against ORDA spec
#   ✅ should reject testament with missing required fields
#   ✅ should validate gate evaluation completeness
#   ✅ should detect missing gates
```

### Test 3: End-to-End AMARA Voice + ORDA

```bash
npm run test -- __tests__/integration/amara-voice-orda-e2e.test.ts

# Expected Output:
# ✅ AMARA Voice + ORDA End-to-End
#   ✅ should process voice query and create publicly verifiable testament
#   ✅ should process multiple language queries
#   ✅ should create 240+ testaments over 16 days (NIST submission proof)
#   ✅ should verify all 7 constitutional gates in testament
#   ✅ should maintain testimony integrity across ORDA anchor
```

### Run All Integration Tests

```bash
npm run test:integration

# Total: 18+ tests, all with real ORDA API calls
```

## Phase 4: Verify Public URLs Work (10 minutes)

```bash
# After running tests, capture a public URL from the output
# Example: https://verify.orda-registry.org/testament/f47ac10b-58cc-4372-a567-0e02b2c3d479

# Test in browser or curl:
curl https://verify.orda-registry.org/testament/[testament-id]

# Expected Response:
# {
#   "id": "testament-...",
#   "agentDid": "did:kheper:agent:amara",
#   "action": "travel.recommendation",
#   "gates": { ... },
#   "timestamp": "...",
#   "publicUrl": "..."
# }
```

## Phase 5: Deploy to Production (30 minutes)

### Step 5.1: Set Vercel Environment Variables

```bash
# If using Vercel
vercel env add ORDA_API_URL
# Enter: https://api.orda-registry.org

vercel env add ORDA_API_KEY
# Enter: your-api-key-here

vercel env add ORDA_VERIFY_URL
# Enter: https://verify.orda-registry.org
```

### Step 5.2: Build and Deploy

```bash
# Build TypeScript
npm run build

# Commit to git
git add -A
git commit -m "feat: real ORDA integration with live API testing"

# Push to deployment branch
git push origin claude/real-orda-verification-urs45

# Deploy (if using Vercel)
vercel deploy --prod
```

### Step 5.3: Verify Deployment

```bash
# Test the deployed API
curl https://theafricaai.app/api/testament/verify/[testament-id]

# Should return 200 OK with testament data
```

## Verification Checklist for NIST Submission

### Pre-Launch (March 18)

- [ ] ORDA API credentials obtained and configured
- [ ] All integration tests passing with real API
- [ ] Public URLs returning 200 status
- [ ] 240+ testaments created across 16 days
- [ ] All 7 constitutional gates evaluated
- [ ] Merkle proofs validated
- [ ] Chain linking verified
- [ ] End-to-end AMARA voice → testament → verification workflow complete

### At NIST Review (April 2)

- [ ] NIST reviewer clicks public verification URL
- [ ] Testament displays with all data
- [ ] All 7 gate results visible
- [ ] AEI/GEI/SHI scores displayed
- [ ] Merkle proof shown
- [ ] Independent verification possible

## Critical Success Metrics

### Requirement 1: Real API Integration
- ❌ Old: Tests pass, URLs don't exist
- ✅ New: Public URLs return 200 OK with testament data

### Requirement 2: Testament Volume
- ❌ Old: No real testaments
- ✅ New: 240+ publicly verifiable testaments by March 18

### Requirement 3: Gate Evaluation
- ❌ Old: Mocked gate results
- ✅ New: All 7 gates evaluated for every testament

### Requirement 4: Public Verification
- ❌ Old: NIST reviewer sees 404
- ✅ New: NIST reviewer sees complete testament with proof

## Troubleshooting

### API Key Issues
```bash
# Verify environment variable
echo $ORDA_API_KEY

# Check .env file
cat .env.production

# Test API connectivity
curl -H "Authorization: Bearer $ORDA_API_KEY" https://api.orda-registry.org/health
```

### Test Failures
```bash
# Run with debug output
DEBUG=* npm run test:integration

# Check logs for specific errors
npm run test -- __tests__/integration/orda-live-api.test.ts -- --verbose
```

### Network Issues
```bash
# Test direct connectivity
ping api.orda-registry.org
curl -I https://api.orda-registry.org

# Check firewall/proxy settings if needed
```

## Rollback Plan

If issues occur:

1. **Minor Issues:** Rerun tests, fix configuration
2. **API Issues:** Contact ORDA team for support
3. **Deployment Issues:** Git reset to last known good state

```bash
# Revert to previous commit
git reset --hard HEAD~1
git push origin claude/real-orda-verification-urs45 --force
```

## Timeline Summary

| Phase | Duration | Completion Target |
|-------|----------|-------------------|
| Get credentials | 15 min | Today |
| Install deps | 10 min | Today |
| Run tests | 30 min | Today |
| Fix issues | Variable | Today |
| Deploy | 30 min | Today |
| **Total** | **~2 hours** | **Today** |

## Post-Deployment

### Monitoring
- Monitor ORDA API response times
- Track test pass/fail rates
- Watch for rate limits

### Daily Tasks
- Generate 15-20 testaments per day
- Verify public URLs work
- Monitor Merkle proof integrity

### NIST Submission (April 2)
- Compile list of 240+ testament URLs
- Prepare documentation
- Submit evidence of public verification

---

**Contact:** For ORDA API issues, contact the ORDA team at support@orda-registry.org

**Updated:** March 17, 2026
