import React, { useEffect, useState } from 'react';

const SAID_AIOT_API_BASE =
  process.env.NEXT_PUBLIC_SAID_AIOT_API_URL || 'https://said-aiot.vercel.app';

interface SaidStatus {
  status: string;
  service: string;
  version: string;
  layer: number;
  gates: number;
}

export default function SAIDTestamentStatus() {
  const [status, setStatus] = useState<SaidStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${SAID_AIOT_API_BASE}/api/status`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'));
  }, []);

  return (
    <section>
      <h2>Testament Engine Status</h2>

      {error && <p style={{ color: 'var(--color-error)' }}>Failed to reach SAID-AIoT: {error}</p>}
      {!status && !error && <p>Loading...</p>}

      {status && (
        <div className="card" style={{ maxWidth: 'none' }}>
          <div className="metadata-grid">
            <div>
              <p className="card-field-label">Service</p>
              <p style={{ margin: 0 }}>{status.service}</p>
            </div>
            <div>
              <p className="card-field-label">Status</p>
              <div className="status-dot-row">
                <span
                  className={`status-dot ${
                    status.status === 'alive' ? 'status-dot-active' : 'status-dot-dissolved'
                  }`}
                />
                <span className="status-label">{status.status}</span>
              </div>
            </div>
            <div>
              <p className="card-field-label">Version</p>
              <span className="mono">{status.version}</span>
            </div>
            <div>
              <p className="card-field-label">Constitutional Gates</p>
              <p style={{ margin: 0 }}>{status.gates} of 7 enforced (G1&ndash;G7)</p>
            </div>
          </div>
        </div>
      )}

      <section style={{ marginTop: 'var(--space-2xl)' }}>
        <h3>API Endpoints</h3>
        <ul>
          <li><span className="mono">POST /v1/agent/provision</span> — provision a new agent</li>
          <li><span className="mono">GET /v1/agent/{'{agent_id}'}</span> — agent metadata and credential status</li>
          <li><span className="mono">POST /v1/action/evaluate</span> — evaluate an action against the Seven Gates (200 pass / 403 blocked)</li>
          <li><span className="mono">GET /v1/testament/{'{id}'}</span> — public verification, no auth required</li>
          <li><span className="mono">GET /v1/testament/agent/{'{agent_id}'}</span> — list testaments for an agent</li>
          <li><span className="mono">POST /v1/agent/{'{agent_id}'}/dissolve</span> — formal, irreversible dissolution</li>
          <li><span className="mono">GET /v1/registry/merkle/{'{agent_id}'}</span> — Merkle root after dissolution</li>
        </ul>
        <p>
          Full API root:{' '}
          <a href={SAID_AIOT_API_BASE} target="_blank" rel="noreferrer">
            {SAID_AIOT_API_BASE}
          </a>
          {' · '}
          <a href={`${SAID_AIOT_API_BASE}/info`} target="_blank" rel="noreferrer">
            about page
          </a>
        </p>
      </section>
    </section>
  );
}
