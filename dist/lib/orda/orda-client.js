"use strict";
/**
 * ORDA Client - Production Integration for Real API Calls
 * Anchors testaments to ORDA registry with public verification URLs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdaClient = void 0;
class OrdaClient {
    constructor(config) {
        this.apiUrl = config.apiUrl;
        this.apiKey = config.apiKey;
        this.verifyUrl = config.verifyUrl || 'https://verify.orda-registry.org';
        this.environment = config.environment || 'production';
    }
    /**
     * Anchor a testament to ORDA registry (REAL API CALL)
     * Returns public verification URL that actually works
     */
    async anchorTestament(testament, options) {
        const response = await fetch(`${this.apiUrl}/v1/testament/anchor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                testament,
                publicVisibility: options?.publicVisibility ?? true,
                metadata: options?.metadata
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`ORDA API Error: ${error.message || response.statusText}`);
        }
        const result = await response.json();
        return {
            testamentId: testament.id,
            ordaId: result.id,
            publicUrl: `${this.verifyUrl}/testament/${result.id}`,
            merkleRoot: result.merkleRoot,
            timestamp: result.timestamp,
            status: 'anchored'
        };
    }
    /**
     * Get public verification URL for a testament
     */
    getPublicVerificationUrl(ordaId) {
        return `${this.verifyUrl}/testament/${ordaId}`;
    }
    /**
     * Batch anchor multiple testaments for efficiency
     */
    async batchAnchorTestaments(testaments) {
        const response = await fetch(`${this.apiUrl}/v1/testament/batch-anchor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ testaments })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Batch anchor failed' }));
            throw new Error(`ORDA batch anchor failed: ${error.message}`);
        }
        return response.json();
    }
    /**
     * Verify testament authenticity against ORDA
     */
    async verifyTestament(testamentId) {
        const response = await fetch(`${this.apiUrl}/v1/testament/verify/${testamentId}`, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to verify testament: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Get Merkle proof for testament
     */
    async getMerkleProof(testamentId) {
        const response = await fetch(`${this.apiUrl}/v1/testament/${testamentId}/merkle-proof`, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to get Merkle proof: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Verify Merkle proof validity
     */
    async verifyMerkleProof(proof) {
        const response = await fetch(`${this.apiUrl}/v1/merkle/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(proof)
        });
        if (!response.ok) {
            return false;
        }
        const result = await response.json();
        return result.valid;
    }
    /**
     * Validate testament schema against ORDA spec
     */
    async validateTestamentSchema(testament) {
        const response = await fetch(`${this.apiUrl}/v1/testament/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(testament)
        });
        if (!response.ok) {
            return ['Schema validation request failed'];
        }
        const result = await response.json();
        return result.errors || [];
    }
    /**
     * Validate gate evaluation completeness
     */
    async validateGates(testament) {
        const errors = [];
        const requiredGates = [
            'g1_utterance',
            'g2_safety',
            'g3_interaction',
            'g4_compliance',
            'g5_audit',
            'g6_enforce',
            'g7_determinism'
        ];
        const gates = testament.payload.gates;
        if (!gates) {
            errors.push('Gates object missing');
            return errors;
        }
        for (const gate of requiredGates) {
            if (!(gate in gates)) {
                errors.push(`Missing gate: ${gate}`);
            }
        }
        return errors;
    }
    /**
     * Get chain of testaments (for chain linking)
     */
    async getChain(testamentId) {
        const response = await fetch(`${this.apiUrl}/v1/testament/${testamentId}/chain`, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to get chain: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Get health status of ORDA API
     */
    async getHealth() {
        const response = await fetch(`${this.apiUrl}/health`, {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        if (!response.ok) {
            throw new Error(`ORDA API health check failed: ${response.statusText}`);
        }
        return response.json();
    }
}
exports.OrdaClient = OrdaClient;
//# sourceMappingURL=orda-client.js.map