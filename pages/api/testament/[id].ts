import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/db/supabase';
import {
  applyCorsHeaders,
  handleCorsPreFlight,
  applyCachingHeaders,
  logRequest,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware';
import type { Testament, ApiResponse } from '@/lib/types';

function mapTestamentRow(row: any): Testament {
  return {
    id: row.testament_id,
    identityId: row.operator_did,
    content: JSON.stringify(
      {
        actionType: row.action_type,
        actionHash: row.action_hash,
        outputHash: row.output_hash,
        gateResults: row.gate_results,
        seSignature: row.se_signature,
      },
      null,
      2
    ),
    timestamp: row.timestamp,
    isActive: row.dissolution_status === null,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Testament>>
) {
  applyCorsHeaders(res);
  const startTime = Date.now();

  if (handleCorsPreFlight(req, res)) {
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    logRequest(req, 400, Date.now() - startTime);
    return res.status(400).json(
      createErrorResponse(400, 'Testament ID is required')
    );
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('testaments')
        .select('*')
        .eq('testament_id', id)
        .single();

      if (error || !data) {
        logRequest(req, 404, Date.now() - startTime);
        return res.status(404).json(
          createErrorResponse(404, 'Testament not found')
        );
      }

      applyCachingHeaders(res, 'immutable', 31536000);
      logRequest(req, 200, Date.now() - startTime);

      return res.status(200).json(createSuccessResponse(mapTestamentRow(data)));
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

  logRequest(req, 405, Date.now() - startTime);
  return res.status(405).json(
    createErrorResponse(405, 'Method not allowed')
  );
}
