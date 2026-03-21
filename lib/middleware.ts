import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Apply CORS headers to the response
 */
export function applyCorsHeaders(res: NextApiResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Handle preflight CORS requests
 */
export function handleCorsPreFlight(
  req: NextApiRequest,
  res: NextApiResponse
): boolean {
  if (req.method === 'OPTIONS') {
    applyCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Apply caching headers for public resources
 */
export function applyCachingHeaders(
  res: NextApiResponse,
  type: 'immutable' | 'public' | 'no-cache' = 'public',
  maxAge: number = 3600
): void {
  if (type === 'immutable') {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (type === 'public') {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  } else if (type === 'no-cache') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

/**
 * Log API request and response
 */
export function logRequest(
  req: NextApiRequest,
  status: number,
  duration: number,
  error?: Error
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.url,
    statusCode: status,
    duration: `${duration}ms`,
    userAgent: req.headers['user-agent'],
    ...(error && { error: error.message }),
  };

  if (status >= 400) {
    console.error('[API_ERROR]', JSON.stringify(logEntry));
  } else {
    console.log('[API_REQUEST]', JSON.stringify(logEntry));
  }
}

/**
 * Validate API key from Authorization header
 */
export function validateApiKey(req: NextApiRequest): boolean {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  const validApiKey = process.env.ORDA_INTERNAL_API_KEY;

  if (!validApiKey) {
    console.warn('Warning: ORDA_INTERNAL_API_KEY is not set');
    return false;
  }

  return apiKey === validApiKey;
}

/**
 * Sanitize query parameters
 */
export function sanitizeParam(param: unknown, type: 'string' | 'number' = 'string'): string | number | null {
  if (param === undefined || param === null) {
    return null;
  }

  const strParam = String(param).trim();

  if (!strParam) {
    return null;
  }

  if (type === 'number') {
    const num = parseInt(strParam, 10);
    return isNaN(num) ? null : num;
  }

  // Prevent common injection patterns
  if (strParam.includes(';') || strParam.includes('--') || strParam.includes('/*')) {
    return null;
  }

  return strParam;
}

/**
 * Create a standard error response
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  details?: string
) {
  return {
    success: false,
    error: message,
    ...(details && { details }),
  };
}

/**
 * Create a standard success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}
