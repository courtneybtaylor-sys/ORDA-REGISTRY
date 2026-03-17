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
import type { Identity, ApiResponse, PaginatedResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<Identity>>>
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
    const pageNum = Math.max(
      1,
      (sanitizeParam(req.query.page, 'number') as number) || 1
    );
    const limitNum = Math.min(
      100,
      Math.max(1, (sanitizeParam(req.query.limit, 'number') as number) || 20)
    );
    const jurisdiction = sanitizeParam(req.query.jurisdiction, 'string') as string | null;
    const status = sanitizeParam(req.query.status, 'string') as string | null;
    const product = sanitizeParam(req.query.product, 'string') as string | null;

    const offset = (pageNum - 1) * limitNum;

    // Build query with filters
    let query = supabase.from('identities').select('*', { count: 'exact' });

    if (jurisdiction) {
      query = query.eq('jurisdiction', jurisdiction);
    }

    if (status && ['active', 'inactive', 'pending'].includes(status)) {
      query = query.eq('status', status);
    }

    if (product) {
      query = query.eq('product', product);
    }

    const { data, error, count } = await query.range(
      offset,
      offset + limitNum - 1
    );

    if (error) {
      logRequest(req, 500, Date.now() - startTime);
      return res.status(500).json(
        createErrorResponse(500, 'Database error', error.message)
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Apply public cache headers for identities list
    applyCachingHeaders(res, 'public', 300);
    logRequest(req, 200, Date.now() - startTime);

    return res.status(200).json(
      createSuccessResponse(
        {
          items: data || [],
          totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
        `Retrieved ${data?.length || 0} identities`
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
