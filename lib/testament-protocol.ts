/**
 * Testament Protocol - Defines the structure of a testament record
 * for ORDA registry anchoring with full governance gate evaluation
 */

export interface Gates {
  g1_utterance: boolean;    // User utterance captured
  g2_safety: boolean;       // Safety evaluation passed
  g3_interaction: boolean;  // Valid interaction
  g4_compliance: boolean;   // Policy compliance
  g5_audit: boolean;        // Audit trail created
  g6_enforce: boolean;      // Enforcement ready
  g7_determinism: boolean;  // Deterministic processing
}

export interface TestamentPayload {
  userLanguage?: string;
  inputMethod?: string;
  canonicalInput?: string;
  claudeResponse?: string;
  gates: Gates;
  aei?: number;  // Agent Effectiveness Index
  gei?: number;  // Gate Effectiveness Index
  shi?: number;  // Safety & Harm Index
  [key: string]: any;
}

export interface Testament {
  id: string;
  said: string;  // Self-addressed identifier
  agentDid: string;
  action: string;
  payload: TestamentPayload;
  signature: string;
  chainLink: string | null;
  timestamp: string;
  registryUrl: string;
}

export interface OrdaAnchorResult {
  testamentId: string;
  ordaId: string;
  publicUrl: string;
  merkleRoot: string;
  timestamp: string;
  status: 'anchored' | 'pending';
}

export interface OrdaBatchResult {
  totalProcessed: number;
  anchored: number;
  failed: number;
  records: OrdaAnchorResult[];
}

export interface MerkleProof {
  path: string[];
  root: string;
  leaf: string;
}

export interface VerificationResult {
  valid: boolean;
  testament: Testament;
  merkleProof: MerkleProof;
}
