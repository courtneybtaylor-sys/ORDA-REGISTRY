/**
 * ORDA Registry Type Definitions
 *
 * View-model shapes consumed by the Next.js pages. API route handlers map
 * the real SAID-AIoT Supabase schema (operators/agents/devices/
 * capability_passports/testaments) into these shapes.
 */

// Flexible gate result map (Postgres jsonb column). Real values observed in
// production are status strings like "pass" / "stamp", not plain booleans,
// so callers should use isGatePassed() from lib/gate-results rather than
// assuming a boolean.
export type GateResults = Record<string, boolean | string | number>;

export interface Identity {
  id: string;
  operatorDid: string;
  name: string;
  email?: string;
  jurisdiction?: string;
  createdAt: string;
  updatedAt: string;
  testamentCount: number;
}

export interface Testament {
  id: string;
  identityId: string;
  actionType: string;
  actionHash: string;
  outputHash: string;
  gateResults: GateResults;
  seSignature: string;
  jurisdiction?: string;
  anchoredAt?: string;
  timestamp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  totalIdentities: number;
  totalTestaments: number;
  activeTestaments: number;
  complianceScore: number;
  averageNistCompliance: number;
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

export interface ComplianceProof {
  testamentId: string;
  nistAlignment: number; // Percentage
  gatesEvaluated: number;
  gatesPassed: number;
  gatesFailed: number;
  hardwareVerified: boolean;
  regulatoryReady: boolean;
  jurisdiction: string;
  gateResults: GateResults;
}

export interface TestamentLogRequest {
  testamentId: string;
  agentDid: string;
  deviceDid: string;
  operatorDid: string;
  passportId?: string;
  actionType: string;
  actionHash: string;
  outputHash: string;
  gateResults: GateResults;
  timestamp: string;
  seSignature: string;
  jurisdiction?: string[];
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
