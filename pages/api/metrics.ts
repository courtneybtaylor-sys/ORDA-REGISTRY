import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/db/supabase';
import type { Metric, ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Metric>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Fetch total identities
    const { count: identityCount } = await supabase
      .from('identities')
      .select('*', { count: 'exact', head: true });

    // Fetch total testaments
    const { count: testamentCount } = await supabase
      .from('testaments')
      .select('*', { count: 'exact', head: true });

    // Fetch active testaments
    const { count: activeCount } = await supabase
      .from('testaments')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const metrics: Metric = {
      totalIdentities: identityCount || 0,
      totalTestaments: testamentCount || 0,
      activeTestaments: activeCount || 0,
      complianceScore: 95,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
