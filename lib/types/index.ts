/**
 * ORDA Registry Type Definitions
 */

export interface Testament {
  id: string;
  identityId: string;
  content: string;
  timestamp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Identity {
  id: string;
  publicKey: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  testamentCount: number;
}

export interface Metric {
  totalIdentities: number;
  totalTestaments: number;
  activeTestaments: number;
  complianceScore: number;
  lastUpdated: string;
}

export interface ComplianceRecord {
  identityId: string;
  identityName: string;
  testamentCount: number;
  lastTestamentDate: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}
