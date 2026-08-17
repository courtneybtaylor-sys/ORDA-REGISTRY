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

  const requiredFields: (keyof TestamentLogRequest)[] = [
    'testamentId',
    'agentDid',
    'deviceDid',
    'operatorDid',
    'actionType',
    'actionHash',
    'outputHash',
    'gateResults',
    'timestamp',
    'seSignature',
  ];
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    logRequest(req, 400, Date.now() - startTime);
    return res.status(400).json(
      createErrorResponse(
        400,
        'Missing required fields',
        `Required: ${missingFields.join(', ')}`
      )
    );
  }

  if (typeof body.gateResults !== 'object' || Object.keys(body.gateResults).length === 0) {
    logRequest(req, 400, Date.now() - startTime);
    return res.status(400).json(
      createErrorResponse(400, 'Invalid gateResults', 'Must be a non-empty object of gate -> boolean')
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('testaments')
      .insert([{
        testament_id: body.testamentId,
        agent_did: body.agentDid,
        device_did: body.deviceDid,
        operator_did: body.operatorDid,
        passport_id: body.passportId || null,
        action_type: body.actionType,
        action_hash: body.actionHash,
        output_hash: body.outputHash,
        gate_results: body.gateResults,
        timestamp: body.timestamp,
        se_signature: body.seSignature,
        jurisdiction: body.jurisdiction || null,
      }])
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
        {
          id: data.testament_id,
          identityId: data.operator_did,
          content: JSON.stringify(
            { actionType: data.action_type, gateResults: data.gate_results },
            null,
            2
          ),
          timestamp: data.timestamp,
          isActive: data.dissolution_status === null,
          createdAt: data.created_at,
          updatedAt: data.created_at,
        },
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
