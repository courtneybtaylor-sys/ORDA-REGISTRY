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

    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('operators')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (jurisdiction) {
      query = query.contains('jurisdiction', [jurisdiction]);
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

    const operators = data || [];
    const operatorDids = operators.map((op: any) => op.operator_did);

    // Testament counts per operator (single follow-up query, no N+1)
    const testamentCounts: Record<string, number> = {};
    if (operatorDids.length > 0) {
      const { data: testamentRows } = await supabase
        .from('testaments')
        .select('operator_did')
        .in('operator_did', operatorDids);

      (testamentRows || []).forEach((row: any) => {
        testamentCounts[row.operator_did] = (testamentCounts[row.operator_did] || 0) + 1;
      });
    }

    const identities: Identity[] = operators.map((op: any) => ({
      id: op.id,
      operatorDid: op.operator_did,
      name: op.legal_name,
      jurisdiction: op.jurisdiction?.[0],
      createdAt: op.created_at,
      updatedAt: op.updated_at,
      testamentCount: testamentCounts[op.operator_did] || 0,
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    applyCachingHeaders(res, 'public', 300);
    logRequest(req, 200, Date.now() - startTime);

    return res.status(200).json(
      createSuccessResponse(
        {
          items: identities,
          totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
        `Retrieved ${identities.length} identities`
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
