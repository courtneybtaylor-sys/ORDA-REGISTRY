import React, { useEffect, useState } from 'react';
import type { Metric } from '@/lib/types';
import ComplianceBar from '@/components/ComplianceBar';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json() as { data: Metric };
          setMetrics(data.data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <main className="container">
      <h1>Registry Dashboard</h1>

      <nav style={{ marginBottom: '2rem' }}>
        <a href="/">&larr; Back to Home</a>
      </nav>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : metrics ? (
        <div>
          <section style={{ marginBottom: '2rem' }}>
            <h2>Key Metrics</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div className="card" style={{ maxWidth: 'none', textAlign: 'center' }}>
                <p className="ui-label">Total Identities</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary-indigo)' }}>
                  {metrics.totalIdentities}
                </p>
              </div>

              <div className="card" style={{ maxWidth: 'none', textAlign: 'center' }}>
                <p className="ui-label">Total Testaments</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary-indigo)' }}>
                  {metrics.totalTestaments}
                </p>
              </div>

              <div className="card" style={{ maxWidth: 'none', textAlign: 'center' }}>
                <p className="ui-label">Active Testaments</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary-indigo)' }}>
                  {metrics.activeTestaments}
                </p>
              </div>

              <div className="card" style={{ maxWidth: 'none', textAlign: 'center' }}>
                <p className="ui-label">Compliance Score</p>
                <ComplianceBar score={metrics.complianceScore} />
              </div>
            </div>
          </section>

          <section>
            <h2>System Information</h2>
            <p><strong>Last Updated:</strong> {new Date(metrics.lastUpdated).toLocaleString()}</p>
          </section>
        </div>
      ) : (
        <p>Failed to load metrics</p>
      )}
    </main>
  );
}
