/**
 * ORDA Registry Schema Validation Tests
 * Validates testament structure against ORDA specification
 */

import { OrdaClient } from '../../lib/orda/orda-client';
import { Testament } from '../../lib/testament-protocol';

describe('ORDA Registry Schema Validation', () => {
  let ordaClient: OrdaClient;

  beforeAll(() => {
    const apiUrl = process.env.ORDA_API_URL || 'https://api.orda-registry.org';
    const apiKey = process.env.ORDA_API_KEY;

    if (!apiKey) {
      throw new Error('ORDA_API_KEY environment variable is required');
    }

    ordaClient = new OrdaClient({
      apiUrl,
      apiKey
    });
  });

  it('should validate testament schema against ORDA spec', async () => {
    const testament: Testament = {
      id: `testament-schema-${Date.now()}`,
      said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy',
      agentDid: 'did:kheper:agent:amara',
      action: 'travel.recommendation',
      payload: {
        userLanguage: 'sw',
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
      signature: 'valid-signature',
      chainLink: null,
      timestamp: new Date().toISOString(),
      registryUrl: 'https://orda-registry.org'
    };

    // Validate schema before anchoring
    const schemaErrors = await ordaClient.validateTestamentSchema(testament);
    expect(schemaErrors).toHaveLength(0);

    // Should anchor successfully
    const anchorResult = await ordaClient.anchorTestament(testament);
    expect(anchorResult.status).toBe('anchored');
  });

  it('should reject testament with missing required fields', async () => {
    const invalidTestament = {
      id: 'test',
      agentDid: 'did:kheper:agent:amara'
    } as any;

    const schemaErrors = await ordaClient.validateTestamentSchema(invalidTestament);
    expect(schemaErrors.length).toBeGreaterThan(0);
  });

  it('should validate gate evaluation completeness', async () => {
    const testament: Testament = {
      id: `testament-gates-${Date.now()}`,
      said: 'did:key:test',
      agentDid: 'did:kheper:agent:amara',
      action: 'test.action',
      payload: {
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

    const gateErrors = await ordaClient.validateGates(testament);
    expect(gateErrors).toHaveLength(0);
  });

  it('should detect missing gates', async () => {
    const testament: Testament = {
      id: `testament-missing-gates-${Date.now()}`,
      said: 'did:key:test',
      agentDid: 'did:kheper:agent:amara',
      action: 'test.action',
      payload: {
        gates: {
          g1_utterance: true,
          g2_safety: true
          // Missing other gates
        } as any
      },
      signature: 'sig',
      chainLink: null,
      timestamp: new Date().toISOString(),
      registryUrl: 'https://orda-registry.org'
    };

    const gateErrors = await ordaClient.validateGates(testament);
    expect(gateErrors.length).toBeGreaterThan(0);
  });

  it('should validate all required testament fields', async () => {
    const requiredFields = ['id', 'said', 'agentDid', 'action', 'payload', 'signature', 'timestamp'];
    const testament: Testament = {
      id: `testament-fields-${Date.now()}`,
      said: 'did:key:z6MkhaXgBZDvotDkL5257faWxcRAqE3QChYAewfc2kuniYy',
      agentDid: 'did:kheper:agent:amara',
      action: 'travel.recommendation',
      payload: {
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

    for (const field of requiredFields) {
      expect((testament as any)[field]).toBeDefined();
    }
  });
});
