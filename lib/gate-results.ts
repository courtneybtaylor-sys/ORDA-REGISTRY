import type { GateResults } from './types';

const FAILURE_VALUES = new Set(['false', 'fail', 'failed', 'no', '0']);

/**
 * A gate result counts as passed unless its value is an explicit failure
 * marker. Real testament gate_results use status strings ("pass", "stamp")
 * rather than booleans, so this treats anything that isn't a recognized
 * failure marker as passing.
 */
export function isGatePassed(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return !FAILURE_VALUES.has(value.trim().toLowerCase());
  return false;
}

export function summarizeGateResults(gateResults: GateResults | null | undefined) {
  const entries = Object.entries(gateResults || {});
  const gatesEvaluated = entries.length;
  const gatesPassed = entries.filter(([, value]) => isGatePassed(value)).length;
  return { gatesEvaluated, gatesPassed, gatesFailed: gatesEvaluated - gatesPassed };
}
