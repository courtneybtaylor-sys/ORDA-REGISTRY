import React from 'react';

interface ComplianceBarProps {
  score: number; // 0-100
}

function tierFor(score: number): { className: string; label: string } {
  if (score >= 100) return { className: 'compliance-full', label: 'Fully Compliant' };
  if (score >= 75) return { className: 'compliance-high', label: 'High Compliance' };
  if (score >= 50) return { className: 'compliance-moderate', label: 'Moderate Compliance' };
  if (score >= 25) return { className: 'compliance-low', label: 'Low Compliance' };
  return { className: 'compliance-failed', label: 'FAILED' };
}

export default function ComplianceBar({ score }: ComplianceBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const { className, label } = tierFor(clamped);

  return (
    <div>
      <div className="compliance-bar-track">
        <div
          className={`compliance-bar-fill ${className}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="ui-label" style={{ marginTop: '4px', marginBottom: 0 }}>
        {clamped}% &mdash; {label}
      </p>
    </div>
  );
}
