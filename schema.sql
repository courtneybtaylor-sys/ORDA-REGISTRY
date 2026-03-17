-- ORDA Registry Database Schema for Supabase
-- This script creates the complete schema for the ORDA Registry system
-- Execute this in the Supabase SQL Editor

-- ============================================================================
-- 1. IDENTITIES TABLE - AI Identity Registry
-- ============================================================================
CREATE TABLE public.identities (
  did TEXT PRIMARY KEY UNIQUE,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('consumer', 'agent', 'enterprise')),
  product TEXT NOT NULL,
  jurisdiction TEXT NOT NULL, -- ISO 3166-1 alpha-2
  activation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gates_active INTEGER NOT NULL DEFAULT 0,
  testaments_generated INTEGER NOT NULL DEFAULT 0,
  compliance_score NUMERIC(3,2) NOT NULL DEFAULT 0.0 CHECK (compliance_score >= 0 AND compliance_score <= 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. TESTAMENTS TABLE - Immutable Action Records
-- ============================================================================
CREATE TABLE public.testaments (
  testament_id TEXT PRIMARY KEY UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_did TEXT NOT NULL REFERENCES public.identities(did) ON DELETE RESTRICT,
  action_type TEXT NOT NULL,
  overall_score NUMERIC(3,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 1),
  hardware_signature TEXT,
  jurisdiction TEXT NOT NULL, -- ISO 3166-1 alpha-2
  nist_compliant BOOLEAN NOT NULL DEFAULT false,
  cryptographic_proof TEXT NOT NULL,
  user_explicit_consent BOOLEAN NOT NULL DEFAULT false,
  data_residency TEXT,
  product TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. GATE EVALUATIONS TABLE - Per-gate Detail (G1-G7)
-- ============================================================================
CREATE TABLE public.gate_evaluations (
  id BIGSERIAL PRIMARY KEY,
  testament_id TEXT NOT NULL REFERENCES public.testaments(testament_id) ON DELETE CASCADE,
  gate_number INTEGER NOT NULL CHECK (gate_number >= 1 AND gate_number <= 7),
  gate_name TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  score NUMERIC(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(testament_id, gate_number)
);

-- ============================================================================
-- 4. METRICS TABLE - Hourly Aggregated Statistics
-- ============================================================================
CREATE TABLE public.metrics (
  metric_hour TIMESTAMP WITH TIME ZONE PRIMARY KEY UNIQUE,
  total_testaments INTEGER NOT NULL DEFAULT 0,
  testaments_hour INTEGER NOT NULL DEFAULT 0,
  avg_compliance NUMERIC(3,2),
  gates_passed_pct NUMERIC(5,2),
  jurisdictions_active INTEGER NOT NULL DEFAULT 0,
  products_active INTEGER NOT NULL DEFAULT 0,
  nist_aligned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. AUDIT LOG TABLE - Registry Modification History
-- ============================================================================
CREATE TABLE public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. INDEXES - Foreign Keys and Common Query Fields
-- ============================================================================

-- Foreign Key Indexes
CREATE INDEX idx_testaments_actor_did ON public.testaments(actor_did);
CREATE INDEX idx_gate_evaluations_testament_id ON public.gate_evaluations(testament_id);

-- Common Query Field Indexes
CREATE INDEX idx_testaments_timestamp ON public.testaments(timestamp);
CREATE INDEX idx_testaments_jurisdiction ON public.testaments(jurisdiction);
CREATE INDEX idx_testaments_product ON public.testaments(product);
CREATE INDEX idx_testaments_action_type ON public.testaments(action_type);
CREATE INDEX idx_testaments_nist_compliant ON public.testaments(nist_compliant);

CREATE INDEX idx_identities_jurisdiction ON public.identities(jurisdiction);
CREATE INDEX idx_identities_product ON public.identities(product);
CREATE INDEX idx_identities_identity_type ON public.identities(identity_type);
CREATE INDEX idx_identities_status ON public.identities(status);

CREATE INDEX idx_gate_evaluations_gate_number ON public.gate_evaluations(gate_number);
CREATE INDEX idx_gate_evaluations_passed ON public.gate_evaluations(passed);

CREATE INDEX idx_metrics_metric_hour ON public.metrics(metric_hour DESC);

CREATE INDEX idx_audit_log_timestamp ON public.audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_id);

-- ============================================================================
-- 7. VIEWS - Compliance Queries
-- ============================================================================

-- View 1: Compliance by Jurisdiction
CREATE VIEW public.v_compliance_by_jurisdiction AS
SELECT
  t.jurisdiction,
  COUNT(DISTINCT t.testament_id) as total_testaments,
  COUNT(DISTINCT t.actor_did) as unique_identities,
  AVG(t.overall_score) as avg_compliance_score,
  SUM(CASE WHEN t.nist_compliant THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0) as nist_compliance_pct,
  COUNT(DISTINCT t.product) as products_count,
  MAX(t.timestamp) as last_testament_date
FROM public.testaments t
GROUP BY t.jurisdiction
ORDER BY avg_compliance_score DESC;

-- View 2: Compliance by Product
CREATE VIEW public.v_compliance_by_product AS
SELECT
  t.product,
  COUNT(DISTINCT t.testament_id) as total_testaments,
  COUNT(DISTINCT t.actor_did) as unique_identities,
  AVG(t.overall_score) as avg_compliance_score,
  SUM(CASE WHEN t.nist_compliant THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0) as nist_compliance_pct,
  COUNT(DISTINCT t.jurisdiction) as jurisdictions_count,
  MAX(t.timestamp) as last_testament_date
FROM public.testaments t
GROUP BY t.product
ORDER BY avg_compliance_score DESC;

-- View 3: Gate Pass Rates
CREATE VIEW public.v_gate_statistics AS
SELECT
  g.gate_number,
  g.gate_name,
  COUNT(DISTINCT g.testament_id) as total_evaluations,
  SUM(CASE WHEN g.passed THEN 1 ELSE 0 END) as gates_passed,
  SUM(CASE WHEN g.passed THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0) as pass_rate,
  AVG(g.score) as avg_gate_score
FROM public.gate_evaluations g
GROUP BY g.gate_number, g.gate_name
ORDER BY g.gate_number;

-- View 4: Identity Performance
CREATE VIEW public.v_identity_performance AS
SELECT
  i.did,
  i.identity_type,
  i.product,
  i.jurisdiction,
  i.status,
  i.testaments_generated,
  i.gates_active,
  i.compliance_score,
  COUNT(DISTINCT t.testament_id) as recent_testaments_7d,
  AVG(t.overall_score) as avg_recent_score,
  MAX(t.timestamp) as last_testament_timestamp,
  i.last_active
FROM public.identities i
LEFT JOIN public.testaments t
  ON i.did = t.actor_did
  AND t.timestamp >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY i.did, i.identity_type, i.product, i.jurisdiction, i.status,
         i.testaments_generated, i.gates_active, i.compliance_score, i.last_active;

-- ============================================================================
-- 8. DATABASE FUNCTIONS
-- ============================================================================

-- Function 1: Update Testament Counts for Identity
CREATE OR REPLACE FUNCTION public.fn_update_identity_testament_count(actor_did TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.identities
  SET
    testaments_generated = (
      SELECT COUNT(*) FROM public.testaments
      WHERE actor_did = $1
    ),
    gates_active = (
      SELECT COUNT(DISTINCT gate_number) FROM public.gate_evaluations g
      INNER JOIN public.testaments t ON g.testament_id = t.testament_id
      WHERE t.actor_did = $1 AND g.passed = true
    ),
    last_active = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE did = $1;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Update Hourly Metrics
CREATE OR REPLACE FUNCTION public.fn_update_hourly_metrics()
RETURNS void AS $$
DECLARE
  v_metric_hour TIMESTAMP WITH TIME ZONE;
BEGIN
  v_metric_hour := DATE_TRUNC('hour', CURRENT_TIMESTAMP);

  INSERT INTO public.metrics (
    metric_hour,
    total_testaments,
    testaments_hour,
    avg_compliance,
    gates_passed_pct,
    jurisdictions_active,
    products_active,
    nist_aligned
  ) VALUES (
    v_metric_hour,
    (SELECT COUNT(*) FROM public.testaments),
    (SELECT COUNT(*) FROM public.testaments
     WHERE timestamp >= v_metric_hour AND timestamp < v_metric_hour + INTERVAL '1 hour'),
    (SELECT AVG(overall_score) FROM public.testaments),
    (SELECT COUNT(DISTINCT testament_id) FILTER (WHERE passed) * 100.0 / NULLIF(COUNT(DISTINCT testament_id), 0)
     FROM public.gate_evaluations),
    (SELECT COUNT(DISTINCT jurisdiction) FROM public.testaments),
    (SELECT COUNT(DISTINCT product) FROM public.testaments),
    (SELECT COUNT(*) FILTER (WHERE nist_compliant) > 0 FROM public.testaments)
  )
  ON CONFLICT (metric_hour) DO UPDATE SET
    total_testaments = EXCLUDED.total_testaments,
    testaments_hour = EXCLUDED.testaments_hour,
    avg_compliance = EXCLUDED.avg_compliance,
    gates_passed_pct = EXCLUDED.gates_passed_pct,
    jurisdictions_active = EXCLUDED.jurisdictions_active,
    products_active = EXCLUDED.products_active,
    nist_aligned = EXCLUDED.nist_aligned,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.testaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Enable public read access on testaments" ON public.testaments
  FOR SELECT USING (true);

CREATE POLICY "Enable public read access on gate_evaluations" ON public.gate_evaluations
  FOR SELECT USING (true);

CREATE POLICY "Enable public read access on identities" ON public.identities
  FOR SELECT USING (true);

CREATE POLICY "Enable public read access on metrics" ON public.metrics
  FOR SELECT USING (true);

CREATE POLICY "Enable public read access on audit_log" ON public.audit_log
  FOR SELECT USING (true);

-- ============================================================================
-- 10. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample identities
INSERT INTO public.identities (
  did,
  identity_type,
  product,
  jurisdiction,
  compliance_score,
  status
) VALUES
(
  'did:example:agent:001',
  'agent',
  'orda-core',
  'US',
  0.95,
  'active'
),
(
  'did:example:consumer:001',
  'consumer',
  'orda-lite',
  'GB',
  0.87,
  'active'
);

-- Insert sample testaments
INSERT INTO public.testaments (
  testament_id,
  actor_did,
  action_type,
  overall_score,
  hardware_signature,
  jurisdiction,
  nist_compliant,
  cryptographic_proof,
  user_explicit_consent,
  data_residency,
  product
) VALUES
(
  'testament:001',
  'did:example:agent:001',
  'data_access',
  0.95,
  'hw_sig_abc123',
  'US',
  true,
  'proof_xyz789',
  true,
  'us-east-1',
  'orda-core'
),
(
  'testament:002',
  'did:example:consumer:001',
  'data_verification',
  0.87,
  'hw_sig_def456',
  'GB',
  true,
  'proof_uvw123',
  true,
  'eu-west-1',
  'orda-lite'
);

-- Insert sample gate evaluations
INSERT INTO public.gate_evaluations (
  testament_id,
  gate_number,
  gate_name,
  passed,
  score,
  reason
) VALUES
('testament:001', 1, 'Identity Verification', true, 1.0, 'DID verified'),
('testament:001', 2, 'Consent Validation', true, 0.95, 'Explicit consent provided'),
('testament:001', 3, 'Jurisdiction Compliance', true, 0.90, 'US GDPR equivalent'),
('testament:001', 4, 'Hardware Signature', true, 1.0, 'Hardware verified'),
('testament:001', 5, 'Cryptographic Proof', true, 0.95, 'Proof validated'),
('testament:001', 6, 'Data Residency', true, 0.90, 'US region compliance'),
('testament:001', 7, 'NIST Alignment', true, 0.95, 'NIST 800-53 compliant'),
('testament:002', 1, 'Identity Verification', true, 0.95, 'DID verified'),
('testament:002', 2, 'Consent Validation', true, 0.90, 'Explicit consent provided'),
('testament:002', 3, 'Jurisdiction Compliance', true, 0.85, 'GB GDPR compliant'),
('testament:002', 4, 'Hardware Signature', true, 0.85, 'Hardware signature ok'),
('testament:002', 5, 'Cryptographic Proof', true, 0.80, 'Proof partially validated'),
('testament:002', 6, 'Data Residency', true, 0.85, 'EU region compliance'),
('testament:002', 7, 'NIST Alignment', true, 0.90, 'NIST 800-53 aligned');

-- Update identity testament counts
SELECT public.fn_update_identity_testament_count('did:example:agent:001');
SELECT public.fn_update_identity_testament_count('did:example:consumer:001');

-- ============================================================================
-- 11. VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables are created
SELECT 'Tables Created Successfully' as verification;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify sample data
SELECT COUNT(*) as total_identities FROM public.identities;
SELECT COUNT(*) as total_testaments FROM public.testaments;
SELECT COUNT(*) as total_gate_evaluations FROM public.gate_evaluations;

-- Verify views
SELECT 'Compliance by Jurisdiction' as view_name;
SELECT * FROM public.v_compliance_by_jurisdiction;

SELECT 'Gate Statistics' as view_name;
SELECT * FROM public.v_gate_statistics;
