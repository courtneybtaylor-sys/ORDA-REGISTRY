import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/db/supabase';
import type { Testament, ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Testament | Testament[]>>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Testament ID is required',
    });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('testaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({
          success: false,
          error: 'Testament not found',
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error fetching testament:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}
