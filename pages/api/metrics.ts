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
import type { Metric, ApiResponse, GateResults } from '@/lib/types';
import { summarizeGateResults } from '@/lib/gate-results';

function complianceFromGateResults(gateResults: GateResults | null): number | null {
  if (!gateResults) return null;
  const { gatesEvaluated, gatesPassed } = summarizeGateResults(gateResults);
  if (gatesEvaluated === 0) return null;
  return (gatesPassed / gatesEvaluated) * 100;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Metric>>
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
    const timeframe = (sanitizeParam(req.query.timeframe, 'string') as string) || '30d';

    const validTimeframes = ['30d', '60d', '90d'];
    if (!validTimeframes.includes(timeframe)) {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Invalid timeframe. Use 30d, 60d, or 90d')
      );
    }

    const now = new Date();
    const days = parseInt(timeframe);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const { count: totalIdentities, error: identitiesError } = await supabase
      .from('operators')
      .select('*', { count: 'exact', head: true });

    if (identitiesError) {
      logRequest(req, 500, Date.now() - startTime);
      return res.status(500).json(
        createErrorResponse(500, 'Database error', identitiesError.message)
      );
    }

    const { count: totalTestaments, error: testamentsError } = await supabase
      .from('testaments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (testamentsError) {
      logRequest(req, 500, Date.now() - startTime);
      return res.status(500).json(
        createErrorResponse(500, 'Database error', testamentsError.message)
      );
    }

    const { count: activeTestaments } = await supabase
      .from('testaments')
      .select('*', { count: 'exact', head: true })
      .is('dissolution_status', null)
      .gte('created_at', startDate.toISOString());

    const { data: gateResultRows } = await supabase
      .from('testaments')
      .select('gate_results')
      .gte('created_at', startDate.toISOString());

    const scores = (gateResultRows || [])
      .map((row: any) => complianceFromGateResults(row.gate_results))
      .filter((score): score is number => score !== null);

    const complianceScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;

    const metric: Metric = {
      totalIdentities: totalIdentities || 0,
      totalTestaments: totalTestaments || 0,
      activeTestaments: activeTestaments || 0,
      complianceScore,
      averageNistCompliance: complianceScore,
      lastUpdated: new Date().toISOString(),
    };

    applyCachingHeaders(res, 'no-cache');
    logRequest(req, 200, Date.now() - startTime);

    return res.status(200).json(createSuccessResponse(metric));
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
