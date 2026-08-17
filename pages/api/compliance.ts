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
import type { ComplianceProof, ApiResponse, GateResults } from '@/lib/types';
import { summarizeGateResults } from '@/lib/gate-results';

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

    const { data: testament, error: testamentError } = await supabase
      .from('testaments')
      .select('*')
      .eq('testament_id', testamentId)
      .single();

    if (testamentError || !testament) {
      logRequest(req, 404, Date.now() - startTime);
      return res.status(404).json(
        createErrorResponse(404, 'Testament not found')
      );
    }

    const gateResults: GateResults = testament.gate_results || {};
    const { gatesEvaluated, gatesPassed, gatesFailed } = summarizeGateResults(gateResults);

    const nistAlignment = gatesEvaluated > 0 ? (gatesPassed / gatesEvaluated) * 100 : 0;
    const hardwareVerified = !!testament.device_did;
    const regulatoryReady = nistAlignment === 100 && hardwareVerified;

    const complianceProof: ComplianceProof = {
      testamentId,
      nistAlignment: Math.round(nistAlignment),
      gatesEvaluated,
      gatesPassed,
      gatesFailed,
      hardwareVerified,
      regulatoryReady,
      jurisdiction: testament.jurisdiction?.[0] || 'Unknown',
      gateResults,
    };

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
