import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/db/supabase';
import type { ComplianceRecord, ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ComplianceRecord[]>>
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

    // Fetch identities with testament counts
    const { data: identities, error: identityError } = await supabase
      .from('identities')
      .select('id, name, created_at')
      .range(offset, offset + limitNum - 1);

    if (identityError) {
      return res.status(500).json({
        success: false,
        error: identityError.message,
      });
    }

    if (!identities || identities.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get testament counts for each identity
    const complianceRecords: ComplianceRecord[] = [];

    for (const identity of identities) {
      const { data: testaments, error: testamentError } = await supabase
        .from('testaments')
        .select('created_at')
        .eq('identity_id', identity.id)
        .order('created_at', { ascending: false });

      if (!testamentError && testaments && testaments.length > 0) {
        complianceRecords.push({
          identityId: identity.id,
          identityName: identity.name,
          testamentCount: testaments.length,
          lastTestamentDate: testaments[0].created_at,
          complianceStatus: testaments.length > 0 ? 'compliant' : 'non-compliant',
        });
      } else {
        complianceRecords.push({
          identityId: identity.id,
          identityName: identity.name,
          testamentCount: 0,
          lastTestamentDate: '',
          complianceStatus: 'non-compliant',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: complianceRecords,
      message: `Retrieved compliance records for ${complianceRecords.length} identities`,
    });
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
