"use strict";
/**
 * ORDA Live API Integration Tests
 * Tests real API calls against ORDA registry
 * CRITICAL: These tests verify that public URLs actually work
 */
Object.defineProperty(exports, "__esModule", { value: true });
const orda_client_1 = require("../../lib/orda/orda-client");
describe('ORDA Live API Integration', () => {
    let ordaClient;
    let testamentId;
    beforeAll(() => {
        // Use REAL ORDA API endpoint from environment
        const apiUrl = process.env.ORDA_API_URL || 'https://api.orda-registry.org';
        const apiKey = process.env.ORDA_API_KEY;
        if (!apiKey) {
            throw new Error('ORDA_API_KEY environment variable is required');
        }
        ordaClient = new orda_client_1.OrdaClient({
            apiUrl,
            apiKey,
            environment: 'production'
        });
    });
    describe('Testament Anchoring (Real API)', () => {
        it('should anchor a test testament to ORDA and return valid public URL', async () => {
            // GIVEN: A valid testament
            const testament = {
                id: `testament-test-${Date.now()}`,
                said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy',
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    userLanguage: 'sw',
                    inputMethod: 'voice',
                    canonicalInput: 'Nataka kuruka kwa Tanzania',
                    claudeResponse: 'Karibu sana! Inashauriwa...',
                    gates: {
                        g1_utterance: true,
                        g2_safety: true,
                        g3_interaction: true,
                        g4_compliance: true,
                        g5_audit: true,
                        g6_enforce: true,
                        g7_determinism: true
                    },
                    aei: 87,
                    gei: 100,
                    shi: 87
                },
                signature: 'signature-string-here',
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            // WHEN: We anchor to ORDA
            const anchorResult = await ordaClient.anchorTestament(testament, {
                publicVisibility: true,
                metadata: {
                    source: 'amara-voice-agent',
                    userLanguage: 'sw',
                    tier: 'boma',
                    sovereignCalendarDay: 18,
                    epoch: 1
                }
            });
            // THEN: We should get a valid ORDA anchor record
            expect(anchorResult).toBeDefined();
            expect(anchorResult.testamentId).toBe(testament.id);
            expect(anchorResult.ordaId).toBeDefined();
            expect(anchorResult.publicUrl).toMatch(/https:\/\/verify\.orda-registry\.org\/testament\//);
            expect(anchorResult.merkleRoot).toBeDefined();
            expect(anchorResult.timestamp).toBeDefined();
            expect(anchorResult.status).toBe('anchored');
            // SAVE: For subsequent verification tests
            testamentId = anchorResult.ordaId;
        }, 10000);
        it('should handle ORDA API errors gracefully', async () => {
            const invalidTestament = {
                id: 'invalid-test',
                said: 'invalid-said',
                agentDid: 'invalid-did',
                action: 'invalid-action',
                payload: {
                    gates: {
                        g1_utterance: false,
                        g2_safety: false,
                        g3_interaction: false,
                        g4_compliance: false,
                        g5_audit: false,
                        g6_enforce: false,
                        g7_determinism: false
                    }
                },
                signature: 'invalid-sig',
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            // Should handle API rejection
            await expect(ordaClient.anchorTestament(invalidTestament)).rejects.toThrow('ORDA API Error');
        }, 10000);
        it('should support batch anchoring (multiple testaments)', async () => {
            const testaments = Array.from({ length: 5 }, (_, i) => ({
                id: `testament-batch-${i}-${Date.now()}`,
                said: `did:key:z6Mk${i}`,
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    test: true,
                    gates: {
                        g1_utterance: true,
                        g2_safety: true,
                        g3_interaction: true,
                        g4_compliance: true,
                        g5_audit: true,
                        g6_enforce: true,
                        g7_determinism: true
                    }
                },
                signature: `sig-${i}`,
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            }));
            const batchResult = await ordaClient.batchAnchorTestaments(testaments);
            expect(batchResult).toBeDefined();
            expect(batchResult.totalProcessed).toBe(5);
            expect(batchResult.anchored).toBe(5);
            expect(batchResult.failed).toBe(0);
            expect(batchResult.records).toHaveLength(5);
        }, 15000);
    });
    describe('Public Verification (Real URLs)', () => {
        it('should generate a valid public verification URL', async () => {
            const publicUrl = ordaClient.getPublicVerificationUrl(testamentId);
            expect(publicUrl).toMatch(/https:\/\/verify\.orda-registry\.org\/testament\//);
            expect(publicUrl).toContain(testamentId);
        });
        it('should verify that public URL returns 200 status', async () => {
            const testament = {
                id: `testament-verify-${Date.now()}`,
                said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy',
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    test: true,
                    gates: {
                        g1_utterance: true,
                        g2_safety: true,
                        g3_interaction: true,
                        g4_compliance: true,
                        g5_audit: true,
                        g6_enforce: true,
                        g7_determinism: true
                    }
                },
                signature: 'sig',
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            const anchorResult = await ordaClient.anchorTestament(testament);
            const publicUrl = anchorResult.publicUrl;
            // CRITICAL: Verify the URL actually responds with the testament
            const response = await fetch(publicUrl);
            expect(response.status).toBe(200);
            const publicData = await response.json();
            expect(publicData.id).toBeDefined();
            expect(publicData.agentDid).toBe(testament.agentDid);
            expect(publicData.action).toBe(testament.action);
        }, 10000);
    });
    describe('ORDA Registry Merkle Proof', () => {
        it('should return valid Merkle proof for testament', async () => {
            const testament = {
                id: `testament-merkle-${Date.now()}`,
                said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy',
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    test: true,
                    gates: {
                        g1_utterance: true,
                        g2_safety: true,
                        g3_interaction: true,
                        g4_compliance: true,
                        g5_audit: true,
                        g6_enforce: true,
                        g7_determinism: true
                    }
                },
                signature: 'sig',
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            const anchorResult = await ordaClient.anchorTestament(testament);
            // Get Merkle proof from ORDA
            const merkleProof = await ordaClient.getMerkleProof(anchorResult.ordaId);
            expect(merkleProof).toBeDefined();
            expect(merkleProof.path).toBeDefined();
            expect(merkleProof.root).toBeDefined();
            expect(merkleProof.leaf).toBe(testament.said);
            // Verify Merkle proof is valid
            const isValid = await ordaClient.verifyMerkleProof(merkleProof);
            expect(isValid).toBe(true);
        }, 10000);
    });
    describe('ORDA Chain Linking', () => {
        it('should link successive testaments in a chain', async () => {
            // First testament
            const testament1 = {
                id: `testament-chain-1-${Date.now()}`,
                said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy',
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    query: 'Flight to Tanzania',
                    gates: {
                        g1_utterance: true,
                        g2_safety: true,
                        g3_interaction: true,
                        g4_compliance: true,
                        g5_audit: true,
                        g6_enforce: true,
                        g7_determinism: true
                    }
                },
                signature: 'sig1',
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            const anchor1 = await ordaClient.anchorTestament(testament1);
            // Second testament (should reference first)
            const testament2 = {
                id: `testament-chain-2-${Date.now()}`,
                said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy2',
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    query: 'Visa requirements',
                    gates: {
                        g1_utterance: true,
                        g2_safety: true,
                        g3_interaction: true,
                        g4_compliance: true,
                        g5_audit: true,
                        g6_enforce: true,
                        g7_determinism: true
                    }
                },
                signature: 'sig2',
                chainLink: anchor1.merkleRoot,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            const anchor2 = await ordaClient.anchorTestament(testament2);
            // Verify chain integrity
            const chain = await ordaClient.getChain(anchor2.ordaId);
            expect(chain.length).toBeGreaterThanOrEqual(2);
            expect(chain[chain.length - 1].id).toBe(anchor1.ordaId);
        }, 10000);
    });
});
//# sourceMappingURL=orda-live-api.test.js.map