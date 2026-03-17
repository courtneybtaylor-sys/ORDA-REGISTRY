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
import type { MetricsBreakdown, ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<MetricsBreakdown>>
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
    const groupBy = (sanitizeParam(req.query.groupBy, 'string') as string) || '';

    // Validate timeframe
    const validTimeframes = ['30d', '60d', '90d'];
    if (!validTimeframes.includes(timeframe)) {
      logRequest(req, 400, Date.now() - startTime);
      return res.status(400).json(
        createErrorResponse(400, 'Invalid timeframe. Use 30d, 60d, or 90d')
      );
    }

    // Calculate date range
    const now = new Date();
    const days = parseInt(timeframe);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch total identities
    const { count: identityCount } = await supabase
      .from('identities')
      .select('*', { count: 'exact', head: true });

    // Fetch total testaments
    const { count: testamentCount } = await supabase
      .from('testaments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Fetch active testaments
    const { count: activeCount } = await supabase
      .from('testaments')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', startDate.toISOString());

    // Calculate average compliance
    const { data: testaments } = await supabase
      .from('testaments')
      .select('overall_score')
      .gte('created_at', startDate.toISOString());

    const avgCompliance = testaments && testaments.length > 0
      ? testaments.reduce((sum: number, t: any) => sum + (t.overall_score || 0), 0) / testaments.length
      : 0;

    const metricsBreakdown: MetricsBreakdown = {
      registryHealth: {
        totalIdentities: identityCount || 0,
        totalTestaments: testamentCount || 0,
        activeTestaments: activeCount || 0,
        overallComplianceScore: Math.round(avgCompliance),
      },
    };

    // Add breakdown by jurisdiction if requested
    if (groupBy === 'jurisdiction') {
      const { data: testamentsByJurisdiction } = await supabase
        .from('testaments')
        .select('jurisdiction, overall_score')
        .gte('created_at', startDate.toISOString());

      const byJurisdiction: Record<string, { testamentCount: number; complianceScore: number }> = {};

      testamentsByJurisdiction?.forEach((t: any) => {
        const jurisdiction = t.jurisdiction || 'Unknown';
        if (!byJurisdiction[jurisdiction]) {
          byJurisdiction[jurisdiction] = { testamentCount: 0, complianceScore: 0 };
        }
        byJurisdiction[jurisdiction].testamentCount++;
        byJurisdiction[jurisdiction].complianceScore += t.overall_score || 0;
      });

      // Calculate average scores
      Object.keys(byJurisdiction).forEach((jurisdiction) => {
        const count = byJurisdiction[jurisdiction].testamentCount;
        byJurisdiction[jurisdiction].complianceScore = Math.round(
          byJurisdiction[jurisdiction].complianceScore / count
        );
      });

      metricsBreakdown.byJurisdiction = byJurisdiction;
    }

    // Add breakdown by product if requested
    if (groupBy === 'product') {
      const { data: identitiesByProduct } = await supabase
        .from('identities')
        .select('product, id')
        .not('product', 'is', null);

      const { data: testamentsByProduct } = await supabase
        .from('testaments')
        .select('identity_id, overall_score')
        .gte('created_at', startDate.toISOString());

      const byProduct: Record<string, { testamentCount: number; complianceScore: number }> = {};

      // Map testaments to products via identity
      testamentsByProduct?.forEach((t: any) => {
        const identity = identitiesByProduct?.find(
          (id: any) => id.id === t.identity_id
        );
        if (identity?.product) {
          if (!byProduct[identity.product]) {
            byProduct[identity.product] = { testamentCount: 0, complianceScore: 0 };
          }
          byProduct[identity.product].testamentCount++;
          byProduct[identity.product].complianceScore += t.overall_score || 0;
        }
      });

      // Calculate average scores
      Object.keys(byProduct).forEach((product) => {
        const count = byProduct[product].testamentCount;
        byProduct[product].complianceScore = Math.round(
          byProduct[product].complianceScore / count
        );
      });

      metricsBreakdown.byProduct = byProduct;
    }

    // Apply no-cache headers for metrics (frequently changing)
    applyCachingHeaders(res, 'no-cache');
    logRequest(req, 200, Date.now() - startTime);

    return res.status(200).json(createSuccessResponse(metricsBreakdown));
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
