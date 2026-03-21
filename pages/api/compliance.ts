import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/db/supabase';
import {
  applyCorsHeaders,
  handleCorsPreFlight,
  applyCachingHeaders,
  logRequest,
  sanitizeParam,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware';
import type { ComplianceProof, ApiResponse, GateEvaluation } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ComplianceProof>>
) {
  applyCorsHeaders(res);
  const startTime = Date.now();

  if (handleCorsPreFlight(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    logRequest(req, 405, Date.now() - startTime);
    return res.status(405).json(
      createErrorResponse(405, 'Method not allowed')
    );
  }

  try {
    const testamentId = sanitizeParam(
      req.query.testament_id || req.query.testamentId,
      'string'
    ) as string | null;

    if (!testamentId) {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Testament ID is required', 'Provide testament_id query parameter')
      );
    }

    // Fetch testament with all gate evaluations
    const { data: testament, error: testamentError } = await supabase
      .from('testaments')
      .select('*')
      .eq('id', testamentId)
      .single();

    if (testamentError || !testament) {
      logRequest(req, 404, Date.now() - startTime);
      return res.status(404).json(
        createErrorResponse(404, 'Testament not found')
      );
    }

    // Parse gates evaluation
    let gatesEvaluation: GateEvaluation[] = [];
    try {
      if (typeof testament.gates_evaluation === 'string') {
        gatesEvaluation = JSON.parse(testament.gates_evaluation);
      } else if (Array.isArray(testament.gates_evaluation)) {
        gatesEvaluation = testament.gates_evaluation;
      }
    } catch (parseError) {
      console.error('Error parsing gates evaluation:', parseError);
      gatesEvaluation = [];
    }

    // Calculate compliance metrics
    const gatesPassed = gatesEvaluation.filter(g => g.passed).length;
    const gatesFailed = gatesEvaluation.filter(g => !g.passed).length;
    const gatesEvaluated = gatesEvaluation.length;

    // Calculate NIST alignment percentage
    // NIST alignment is based on: all gates passed + overall score >= 80
    const nistAlignment = (gatesPassed / Math.max(gatesEvaluated, 1)) * 100;

    // Determine if hardware was verified (hardware_security gate)
    const hardwareGate = gatesEvaluation.find(g => g.gate === 'hardware_security');
    const hardwareVerified = hardwareGate?.passed ?? false;

    // Regulatory ready = NIST compliant AND hardware verified
    const regulatoryReady = testament.nist_compliant && hardwareVerified;

    // Build details map
    const details: Record<string, any> = {};
    gatesEvaluation.forEach(gate => {
      details[gate.gate] = {
        passed: gate.passed,
        score: gate.score,
        details: gate.details,
      };
    });

    const complianceProof: ComplianceProof = {
      testamentId,
      nistAlignment: Math.round(nistAlignment),
      gatesEvaluated,
      gatesPassed,
      gatesFailed,
      hardwareVerified,
      regulatoryReady,
      jurisdiction: testament.jurisdiction || 'Unknown',
      details,
    };

    // Apply immutable cache headers for compliance proofs
    applyCachingHeaders(res, 'immutable', 31536000);
    logRequest(req, 200, Date.now() - startTime);

    return res.status(200).json(createSuccessResponse(complianceProof));
  } catch (error) {
    const duration = Date.now() - startTime;
    logRequest(req, 500, duration, error as Error);
    return res.status(500).json(
      createErrorResponse(
        500,
        'Internal server error',
        (error as Error).message
      )
    );
  }
}
