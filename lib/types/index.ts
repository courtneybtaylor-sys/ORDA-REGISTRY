/**
 * ORDA Registry Type Definitions
 */

// Gate evaluation types (7 gates)
export type GateType =
  | 'identity_verification'
  | 'credential_validation'
  | 'hardware_security'
  | 'data_integrity'
  | 'audit_compliance'
  | 'governance_framework'
  | 'regulatory_approval';

export interface GateEvaluation {
  gate: GateType;
  passed: boolean;
  score: number; // 0-100
  details: string;
  evaluatedAt: string;
  evidence?: string;
}

export interface Testament {
  id: string;
  identityId: string;
  actorDid: string;
  content: string;
  timestamp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gatesEvaluation: GateEvaluation[];
  overallScore: number;
  jurisdiction?: string;
  nistCompliant: boolean;
}

export interface Identity {
  id: string;
  publicKey: string;
  name: string;
  type: 'ai_agent' | 'person' | 'enterprise';
  email?: string;
  jurisdiction?: string;
  status: 'active' | 'inactive' | 'pending';
  product?: string;
  createdAt: string;
  updatedAt: string;
  testamentCount: number;
}

export interface Metric {
  totalIdentities: number;
  totalTestaments: number;
  activeTestaments: number;
  complianceScore: number;
  averageNistCompliance: number;
  lastUpdated: string;
}

export interface MetricsBreakdown {
  registryHealth: {
    totalIdentities: number;
    totalTestaments: number;
    activeTestaments: number;
    overallComplianceScore: number;
  };
  byJurisdiction?: Record<string, {
    testamentCount: number;
    complianceScore: number;
  }>;
  byProduct?: Record<string, {
    testamentCount: number;
    complianceScore: number;
  }>;
}

export interface ComplianceRecord {
  identityId: string;
  identityName: string;
  testamentCount: number;
  lastTestamentDate: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  notes?: string;
}

export interface ComplianceProof {
  testamentId: string;
  nistAlignment: number; // Percentage
  gatesEvaluated: number;
  gatesPassed: number;
  gatesFailed: number;
  hardwareVerified: boolean;
  regulatoryReady: boolean;
  jurisdiction: string;
  details: {
    [key in GateType]?: {
      passed: boolean;
      score: number;
      details: string;
    };
  };
}

export interface TestamentLogRequest {
  testamentId?: string;
  actorDid: string;
  gatesEvaluation: GateEvaluation[];
  timestamp: string;
  jurisdiction?: string;
  nistCompliant?: boolean;
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

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
