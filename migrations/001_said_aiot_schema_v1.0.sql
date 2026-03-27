-- ============================================================================
-- SAID-AIoT DATABASE SCHEMA v1.0
-- Migration: Create complete database structure
-- Date: March 27, 2026
-- ============================================================================

-- ============================================================================
-- LAYER 1: IDENTITY LAYER (DID Registry)
-- ============================================================================

-- Operators (Organizations)
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_did TEXT UNIQUE NOT NULL,  -- did:said:operator:...
  legal_name TEXT NOT NULL,
  jurisdiction TEXT[],  -- ['US', 'EU']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents (AI Agents)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_did TEXT UNIQUE NOT NULL,  -- did:said:agent:...
  operator_id UUID REFERENCES operators(id),
  version TEXT NOT NULL,
  model_name TEXT,
  status TEXT DEFAULT 'active',  -- active, dissolved
  dissolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_operator ON agents(operator_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_did ON agents(agent_did);

-- Devices (Hardware/Compute Nodes)
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_did TEXT UNIQUE NOT NULL,  -- did:said:device:...
  secure_element_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  device_type TEXT,  -- 'hardware', 'cloud', 'edge'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_did ON devices(device_did);

-- ============================================================================
-- LAYER 2: CAPABILITY & AUTHORITY
-- ============================================================================

-- Capability Passports
CREATE TABLE IF NOT EXISTS capability_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id TEXT UNIQUE NOT NULL,  -- cred:said:...
  agent_did TEXT NOT NULL,
  operator_did TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  scope TEXT[],  -- ['loan_underwriting', 'risk_assessment']
  excluded TEXT[],  -- ['rate_policy_change']
  human_in_loop JSONB,  -- {required_before: ['final_denial_over_500k']}
  jurisdiction TEXT[],
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passports_agent ON capability_passports(agent_did);
CREATE INDEX IF NOT EXISTS idx_passports_operator ON capability_passports(operator_did);
CREATE INDEX IF NOT EXISTS idx_passports_expires ON capability_passports(expires_at);
CREATE INDEX IF NOT EXISTS idx_passports_revoked ON capability_passports(revoked);

-- ============================================================================
-- LAYER 3: TESTAMENT (Action Records)
-- ============================================================================

-- Testaments (Immutable Action Records)
CREATE TABLE IF NOT EXISTS testaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testament_id TEXT UNIQUE NOT NULL,  -- uuid-v4
  agent_did TEXT NOT NULL,
  device_did TEXT NOT NULL,
  operator_did TEXT NOT NULL,
  passport_id TEXT,
  action_type TEXT NOT NULL,
  action_hash TEXT NOT NULL,  -- sha256(action_payload)
  output_hash TEXT NOT NULL,  -- sha256(output_payload)
  gate_results JSONB NOT NULL,  -- {G1:pass, G2:pass, ..., G7:stamp}
  timestamp TIMESTAMPTZ NOT NULL,
  se_signature TEXT NOT NULL,  -- Secure Element signature
  jurisdiction TEXT[],
  spatial_context JSONB,  -- 3D coordinates if applicable
  anchored_at TEXT DEFAULT 'registry.said.dev',
  dissolution_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testaments_agent ON testaments(agent_did);
CREATE INDEX IF NOT EXISTS idx_testaments_device ON testaments(device_did);
CREATE INDEX IF NOT EXISTS idx_testaments_operator ON testaments(operator_did);
CREATE INDEX IF NOT EXISTS idx_testaments_timestamp ON testaments(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_testaments_action_type ON testaments(action_type);
CREATE INDEX IF NOT EXISTS idx_testaments_id ON testaments(testament_id);

-- ============================================================================
-- LAYER 4: MA'AT ENGINE (Governance & Audit)
-- ============================================================================

-- Decree Audit Logs (Ma'at Veracity Engine)
CREATE TABLE IF NOT EXISTS decree_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User & Request
  user_id UUID,  -- References auth.users(id) - nullable for unauthenticated
  query TEXT NOT NULL,
  destination VARCHAR(2),
  intent VARCHAR(50),

  -- Gate Results
  gate_approved BOOLEAN NOT NULL,
  gate_confidence DECIMAL(3, 2),
  gate_signals JSONB,
  gate_heartbeat_results JSONB,

  -- Confidence Metrics
  total_confidence_score DECIMAL(3, 2),
  source_quality_avg DECIMAL(3, 2),
  recency_bonus DECIMAL(3, 2),
  conflict_penalty DECIMAL(3, 2),
  confidence_breakdown JSONB,

  -- Metadata
  agent_count INT,
  processing_time_ms INT,
  formula_version VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decree_user ON decree_audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_decree_destination ON decree_audit_logs(destination);
CREATE INDEX IF NOT EXISTS idx_decree_confidence ON decree_audit_logs(total_confidence_score);
CREATE INDEX IF NOT EXISTS idx_decree_created ON decree_audit_logs(created_at DESC);

-- Source Reliability Tracking
CREATE TABLE IF NOT EXISTS source_reliability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(20) NOT NULL,  -- 'government', 'partner_api', etc.
  weight DECIMAL(3, 2),  -- 0.0-1.0
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source ON source_reliability(source_name, effective_date);

-- ============================================================================
-- LAYER 5: PROVIDER DATA (Africa AI App)
-- ============================================================================

-- Providers (Travel, Services, etc.)
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  destination_code VARCHAR(2),  -- ISO country code
  status TEXT DEFAULT 'ACTIVE',  -- ACTIVE, VERIFIED, SUSPENDED
  provider_type TEXT,  -- 'airline', 'hotel', 'tour_operator'
  contact_info JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_destination ON providers(destination_code, status);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);

-- Provider Scores
CREATE TABLE IF NOT EXISTS provider_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  overall DECIMAL(3, 2),
  reliability DECIMAL(3, 2),
  compliance DECIMAL(3, 2),
  user_satisfaction DECIMAL(3, 2),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_scores ON provider_scores(provider_id, calculated_at DESC);

-- Provider Data Updates (Freshness Tracking)
CREATE TABLE IF NOT EXISTS provider_data_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination VARCHAR(2),
  timestamp TIMESTAMPTZ NOT NULL,
  update_type TEXT,  -- 'visa', 'pricing', 'availability'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destination_timestamp ON provider_data_updates(destination, timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE testaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE decree_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_passports ENABLE ROW LEVEL SECURITY;

-- Public read access for testaments (verification)
DROP POLICY IF EXISTS "Testaments are publicly readable" ON testaments;
CREATE POLICY "Testaments are publicly readable"
  ON testaments FOR SELECT
  USING (true);

-- Users can only see their own decree logs
DROP POLICY IF EXISTS "Users can view own decrees" ON decree_audit_logs;
CREATE POLICY "Users can view own decrees"
  ON decree_audit_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Operators can manage their own passports
DROP POLICY IF EXISTS "Operators manage own passports" ON capability_passports;
CREATE POLICY "Operators manage own passports"
  ON capability_passports FOR ALL
  USING (
    operator_did IN (
      SELECT operator_did FROM operators
      WHERE id = auth.uid()::uuid
    )
  );

-- ============================================================================
-- SEED DATA (Initial Source Reliability Weights)
-- ============================================================================

INSERT INTO source_reliability (source_name, source_type, weight, effective_date, notes)
VALUES
  ('Ghana Immigration Service', 'government', 1.00, CURRENT_DATE, 'Official government source'),
  ('Kenya eVisa Portal', 'government', 1.00, CURRENT_DATE, 'Official government source'),
  ('South Africa Home Affairs', 'government', 1.00, CURRENT_DATE, 'Official government source'),
  ('Partner API', 'partner_api', 0.90, CURRENT_DATE, 'Verified travel data provider'),
  ('Community Report', 'community', 0.70, CURRENT_DATE, 'Verified user contributions'),
  ('Third-party Aggregator', 'aggregator', 0.60, CURRENT_DATE, 'Secondary sources')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
