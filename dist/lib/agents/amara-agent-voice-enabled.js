"use strict";
/**
 * AMARA Agent - Voice Enabled with ORDA Integration
 * Processes voice and text queries with constitutional gate evaluation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmaraAgentVoiceEnabled = void 0;
class AmaraAgentVoiceEnabled {
    constructor(config) {
        this.ordaClient = config.ordaClient;
    }
    /**
     * Handle user query with voice support and ORDA anchoring
     */
    async handleUserQuery(input, tier) {
        try {
            // Simulate Claude processing with gate evaluation
            const gateResults = this.evaluateConstitutionalGates(input.text);
            const textResponse = this.generateResponse(input.text, input.userLanguage);
            // Create testament
            const testament = {
                id: `testament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                said: `did:key:amara-${Date.now()}`,
                agentDid: 'did:kheper:agent:amara',
                action: 'travel.recommendation',
                payload: {
                    userLanguage: input.userLanguage,
                    inputMethod: input.voice ? 'voice' : 'text',
                    canonicalInput: input.text,
                    claudeResponse: textResponse,
                    gates: {
                        g1_utterance: gateResults.g1_utterance,
                        g2_safety: gateResults.g2_safety,
                        g3_interaction: gateResults.g3_interaction,
                        g4_compliance: gateResults.g4_compliance,
                        g5_audit: gateResults.g5_audit,
                        g6_enforce: gateResults.g6_enforce,
                        g7_determinism: gateResults.g7_determinism
                    },
                    aei: 87,
                    gei: 100,
                    shi: 87,
                    tier
                },
                signature: this.generateSignature(input.text),
                chainLink: null,
                timestamp: new Date().toISOString(),
                registryUrl: 'https://orda-registry.org'
            };
            // Anchor to ORDA with real API call
            const anchorResult = await this.ordaClient.anchorTestament(testament, {
                publicVisibility: true,
                metadata: {
                    source: 'amara-voice-agent',
                    userLanguage: input.userLanguage,
                    tier,
                    sovereignCalendarDay: new Date().getDate(),
                    epoch: 1
                }
            });
            return {
                success: true,
                textResponse,
                testament: {
                    id: testament.id,
                    ordaUrl: anchorResult.publicUrl,
                    gates: gateResults
                }
            };
        }
        catch (error) {
            return {
                success: false,
                textResponse: '',
                testament: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Evaluate constitutional gates
     */
    evaluateConstitutionalGates(input) {
        // Simplified gate evaluation logic
        return {
            g1_utterance: !!input,
            g2_safety: !this.containsHarmfulContent(input),
            g3_interaction: this.isValidInteraction(input),
            g4_compliance: this.meetsComplianceRequirements(input),
            g5_audit: true,
            g6_enforce: true,
            g7_determinism: true
        };
    }
    /**
     * Generate response text (simulates Claude)
     */
    generateResponse(input, language) {
        const responses = {
            sw: 'Karibu sana! Inashauriwa zidi juhudi katika uganaji wa safari yako.',
            en: 'Welcome! I recommend considering these travel options.',
            am: 'ደህና መጡ! እነዚህን የጉዞ አማራጮች ማጤን ይመከራል።',
            fr: 'Bienvenue! Je vous recommande de considérer ces options de voyage.'
        };
        return responses[language] || responses.en;
    }
    /**
     * Generate signature (mock)
     */
    generateSignature(input) {
        return `sig_${Date.now()}_${input.length}`;
    }
    /**
     * Safety evaluation
     */
    containsHarmfulContent(input) {
        const harmfulPatterns = ['violence', 'hate', 'illegal'];
        return harmfulPatterns.some(p => input.toLowerCase().includes(p));
    }
    /**
     * Interaction validation
     */
    isValidInteraction(input) {
        return input.length > 3 && input.length < 1000;
    }
    /**
     * Compliance check
     */
    meetsComplianceRequirements(input) {
        return !input.includes('confidential') && !input.includes('private');
    }
}
exports.AmaraAgentVoiceEnabled = AmaraAgentVoiceEnabled;
//# sourceMappingURL=amara-agent-voice-enabled.js.map