import React from 'react';

interface StatusDotProps {
  isActive: boolean;
  dissolutionStatus?: string | null;
}

export default function StatusDot({ isActive, dissolutionStatus }: StatusDotProps) {
  return (
    <span className="status-dot-row">
      <span className={`status-dot ${isActive ? 'status-dot-active' : 'status-dot-dissolved'}`} />
      <span className="status-label">
        {isActive ? 'Active' : `Dissolved${dissolutionStatus ? `: ${dissolutionStatus}` : ''}`}
      </span>
    </span>
  );
}
