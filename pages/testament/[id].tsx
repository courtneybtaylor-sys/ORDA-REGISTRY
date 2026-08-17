import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Testament } from '@/lib/types';
import { summarizeGateResults } from '@/lib/gate-results';
import GateBadge from '@/components/GateBadge';
import StatusDot from '@/components/StatusDot';

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span
      className="card-field-value-mono"
      style={{ cursor: 'pointer' }}
      onClick={copy}
      title="Click to copy"
    >
      {value} {copied ? '(copied)' : ''}
    </span>
  );
}

export default function TestamentViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [testament, setTestament] = useState<Testament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTestament = async () => {
      try {
        const response = await fetch(`/api/testament/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTestament(data.data);
        } else {
          setError('Testament not found');
        }
      } catch (err) {
        setError('Failed to load testament');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestament();
  }, [id]);

  if (loading) {
    return <main className="container"><p>Loading...</p></main>;
  }

  if (error) {
    return (
      <main className="container">
        <h1>Error</h1>
        <p>{error}</p>
        <a href="/">Back to home</a>
      </main>
    );
  }

  if (!testament) {
    return null;
  }

  const { gatesEvaluated, gatesPassed } = summarizeGateResults(testament.gateResults);
  const nistAligned = gatesEvaluated > 0 && gatesPassed === gatesEvaluated;

  return (
    <main className="container">
      <a href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Back</a>

      <div className="card card-detail">
        <h2 style={{ marginBottom: '20px' }}>&#128274; Testament Details</h2>

        <div style={{ marginBottom: '20px' }}>
          <p className="card-field-label">Testament ID</p>
          <CopyableValue value={testament.id} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p className="card-field-label">Operator DID</p>
          <CopyableValue value={testament.identityId} />
        </div>

        <div className="card-section">
          <p className="card-field-label" style={{ marginBottom: '12px' }}>Constitutional Gates</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(testament.gateResults).map(([gate, value]) => (
              <GateBadge key={gate} gate={gate} value={value} />
            ))}
          </div>
        </div>

        <div className="card-section">
          <p className="card-field-label">Secure-Element Signature</p>
          <span
            className="card-field-value-mono"
            style={{ display: 'block', maxHeight: '80px', overflowY: 'auto' }}
          >
            {testament.seSignature}
          </span>
        </div>

        <div className="card-section metadata-grid">
          <div>
            <p className="card-field-label">Recorded</p>
            <p style={{ margin: 0 }}>{new Date(testament.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="card-field-label">Anchored At</p>
            <p style={{ margin: 0 }}>{testament.anchoredAt || '—'}</p>
          </div>
          <div>
            <p className="card-field-label">Action Type</p>
            <p style={{ margin: 0 }}>{testament.actionType}</p>
          </div>
          <div>
            <p className="card-field-label">Jurisdiction</p>
            <p style={{ margin: 0 }}>{testament.jurisdiction || '—'}</p>
          </div>
          <div>
            <p className="card-field-label">Status</p>
            <StatusDot isActive={testament.isActive} />
          </div>
          <div>
            <p className="card-field-label">NIST Aligned</p>
            <p style={{ margin: 0, color: nistAligned ? 'var(--color-success)' : 'var(--color-error)' }}>
              {nistAligned ? '✓ Yes' : `${gatesPassed}/${gatesEvaluated} gates`}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
