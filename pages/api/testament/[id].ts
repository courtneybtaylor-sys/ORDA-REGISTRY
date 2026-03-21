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
        .eq('id', id)
        .single();

      if (error) {
        logRequest(req, 404, Date.now() - startTime);
        return res.status(404).json(
          createErrorResponse(404, 'Testament not found')
        );
      }

      // Apply immutable cache headers for testaments
      applyCachingHeaders(res, 'immutable', 31536000);
      logRequest(req, 200, Date.now() - startTime);

      return res.status(200).json(createSuccessResponse(data));
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
