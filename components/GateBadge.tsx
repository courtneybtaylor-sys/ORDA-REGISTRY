import React from 'react';
import { isGatePassed } from '@/lib/gate-results';

interface GateBadgeProps {
  gate: string;
  value: boolean | string | number;
}

export default function GateBadge({ gate, value }: GateBadgeProps) {
  const passed = isGatePassed(value);
  return (
    <span className={`gate-badge ${passed ? 'gate-badge-pass' : 'gate-badge-fail'}`}>
      {passed ? '✓' : '✗'} {gate}: {String(value)}
    </span>
  );
}
