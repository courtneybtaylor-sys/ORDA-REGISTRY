import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { Testament, ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Testament>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const { identityId, content } = req.body;

  if (!identityId || !content) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: identityId, content',
    });
  }

  try {
    const testament = {
      identity_id: identityId,
      content,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('testaments')
      .insert([testament])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      data,
      message: 'Testament logged successfully',
    });
  } catch (error) {
    console.error('Error logging testament:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
