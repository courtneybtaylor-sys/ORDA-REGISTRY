/**
 * ORDA Client - Production Integration for Real API Calls
 * Anchors testaments to ORDA registry with public verification URLs
 */
import { Testament, OrdaAnchorResult, OrdaBatchResult, MerkleProof, VerificationResult } from '../testament-protocol';
export declare class OrdaClient {
    private apiUrl;
    private apiKey;
    private verifyUrl;
    private environment;
    constructor(config: {
        apiUrl: string;
        apiKey: string;
        verifyUrl?: string;
        environment?: 'production' | 'sandbox';
    });
    /**
     * Anchor a testament to ORDA registry (REAL API CALL)
     * Returns public verification URL that actually works
     */
    anchorTestament(testament: Testament, options?: {
        publicVisibility?: boolean;
        metadata?: Record<string, any>;
    }): Promise<OrdaAnchorResult>;
    /**
     * Get public verification URL for a testament
     */
    getPublicVerificationUrl(ordaId: string): string;
    /**
     * Batch anchor multiple testaments for efficiency
     */
    batchAnchorTestaments(testaments: Testament[]): Promise<OrdaBatchResult>;
    /**
     * Verify testament authenticity against ORDA
     */
    verifyTestament(testamentId: string): Promise<VerificationResult>;
    /**
     * Get Merkle proof for testament
     */
    getMerkleProof(testamentId: string): Promise<MerkleProof>;
    /**
     * Verify Merkle proof validity
     */
    verifyMerkleProof(proof: MerkleProof): Promise<boolean>;
    /**
     * Validate testament schema against ORDA spec
     */
    validateTestamentSchema(testament: any): Promise<string[]>;
    /**
     * Validate gate evaluation completeness
     */
    validateGates(testament: Testament): Promise<string[]>;
    /**
     * Get chain of testaments (for chain linking)
     */
    getChain(testamentId: string): Promise<Testament[]>;
    /**
     * Get health status of ORDA API
     */
    getHealth(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
//# sourceMappingURL=orda-client.d.ts.map