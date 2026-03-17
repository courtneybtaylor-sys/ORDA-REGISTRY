import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/db/supabase';
import {
  applyCorsHeaders,
  handleCorsPreFlight,
  logRequest,
  validateApiKey,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware';
import type { Testament, ApiResponse, TestamentLogRequest } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Testament>>
) {
  applyCorsHeaders(res);
  const startTime = Date.now();

  if (handleCorsPreFlight(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    logRequest(req, 405, Date.now() - startTime);
    return res.status(405).json(
      createErrorResponse(405, 'Method not allowed')
    );
  }

  // Validate API key for internal endpoint
  if (!validateApiKey(req)) {
    logRequest(req, 401, Date.now() - startTime);
    return res.status(401).json(
      createErrorResponse(
        401,
        'Unauthorized - Invalid or missing API key'
      )
    );
  }

  const body: TestamentLogRequest = req.body;

  // Validate required fields
  if (!body.actorDid || !body.gatesEvaluation || !Array.isArray(body.gatesEvaluation)) {
    logRequest(req, 400, Date.now() - startTime);
    return res.status(400).json(
      createErrorResponse(
        400,
        'Missing required fields',
        'Required: actorDid, gatesEvaluation (array), timestamp'
      )
    );
  }

  // Validate gates evaluation
  if (body.gatesEvaluation.length !== 7) {
    logRequest(req, 400, Date.now() - startTime);
    return res.status(400).json(
      createErrorResponse(
        400,
        'Invalid gates evaluation',
        'Exactly 7 gate evaluations required'
      )
    );
  }

  // Validate each gate evaluation
  const validGates = [
    'identity_verification',
    'credential_validation',
    'hardware_security',
    'data_integrity',
    'audit_compliance',
    'governance_framework',
    'regulatory_approval',
  ];

  for (const gate of body.gatesEvaluation) {
    if (!validGates.includes(gate.gate)) {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Invalid gate type', `Unknown gate: ${gate.gate}`)
      );
    }

    if (typeof gate.score !== 'number' || gate.score < 0 || gate.score > 100) {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Invalid gate score', 'Score must be between 0 and 100')
      );
    }

    if (typeof gate.passed !== 'boolean') {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Invalid gate passed field', 'Must be boolean')
      );
    }
  }

  try {
    // Calculate overall score (average of all gate scores)
    const overallScore = Math.round(
      body.gatesEvaluation.reduce((sum, g) => sum + g.score, 0) / body.gatesEvaluation.length
    );

    // Determine NIST compliance (all gates must be passed and score >= 80)
    const nistCompliant = body.gatesEvaluation.every(g => g.passed) && overallScore >= 80;

    const testament = {
      actor_did: body.actorDid,
      timestamp: body.timestamp,
      is_active: true,
      gates_evaluation: JSON.stringify(body.gatesEvaluation),
      overall_score: overallScore,
      jurisdiction: body.jurisdiction || null,
      nist_compliant: nistCompliant,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('testaments')
      .insert([testament])
      .select()
      .single();

    if (error) {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Database error', error.message)
      );
    }

    logRequest(req, 201, Date.now() - startTime);

    return res.status(201).json(
      createSuccessResponse(
        data,
        'Testament logged successfully'
      )
    );
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
