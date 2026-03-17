/**
 * Testament Protocol - Defines the structure of a testament record
 * for ORDA registry anchoring with full governance gate evaluation
 */
export interface Gates {
    g1_utterance: boolean;
    g2_safety: boolean;
    g3_interaction: boolean;
    g4_compliance: boolean;
    g5_audit: boolean;
    g6_enforce: boolean;
    g7_determinism: boolean;
}
export interface TestamentPayload {
    userLanguage?: string;
    inputMethod?: string;
    canonicalInput?: string;
    claudeResponse?: string;
    gates: Gates;
    aei?: number;
    gei?: number;
    shi?: number;
    [key: string]: any;
}
export interface Testament {
    id: string;
    said: string;
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
//# sourceMappingURL=testament-protocol.d.ts.map