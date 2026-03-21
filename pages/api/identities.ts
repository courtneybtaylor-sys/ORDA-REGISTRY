import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/db/supabase';
import type { Identity, ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Identity[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { data, error } = await supabase
      .from('identities')
      .select('*')
      .range(offset, offset + limitNum - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      message: `Retrieved ${data?.length || 0} identities`,
    });
  } catch (error) {
    console.error('Error fetching identities:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
