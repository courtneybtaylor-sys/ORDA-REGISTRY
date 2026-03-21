/**
 * AMARA Agent - Voice Enabled with ORDA Integration
 * Processes voice and text queries with constitutional gate evaluation
 */
import { OrdaClient } from '../orda/orda-client';
export interface UserQuery {
    text: string;
    voice?: boolean;
    userLanguage: string;
    tier: 'boma' | 'district' | 'region' | 'national';
}
export interface AmaraResponse {
    success: boolean;
    textResponse: string;
    testament: {
        id: string;
        ordaUrl: string;
        gates: Record<string, boolean>;
    } | null;
    error?: string;
}
export declare class AmaraAgentVoiceEnabled {
    private ordaClient;
    constructor(config: {
        ordaClient: OrdaClient;
    });
    /**
     * Handle user query with voice support and ORDA anchoring
     */
    handleUserQuery(input: UserQuery, tier: string): Promise<AmaraResponse>;
    /**
     * Evaluate constitutional gates
     */
    private evaluateConstitutionalGates;
    /**
     * Generate response text (simulates Claude)
     */
    private generateResponse;
    /**
     * Generate signature (mock)
     */
    private generateSignature;
    /**
     * Safety evaluation
     */
    private containsHarmfulContent;
    /**
     * Interaction validation
     */
    private isValidInteraction;
    /**
     * Compliance check
     */
    private meetsComplianceRequirements;
}
//# sourceMappingURL=amara-agent-voice-enabled.d.ts.map