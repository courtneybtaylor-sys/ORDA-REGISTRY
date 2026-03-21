import React, { useEffect, useState } from 'react';
import type { Metric } from '@/lib/types';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
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
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Registry Dashboard</h1>

      <nav style={{ marginBottom: '2rem' }}>
        <a href="/" style={{ marginRight: '1rem' }}>← Back to Home</a>
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
              <div style={{
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Total Identities</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
                  {metrics.totalIdentities}
                </p>
              </div>

              <div style={{
                border: '2px solid #28a745',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Total Testaments</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
                  {metrics.totalTestaments}
                </p>
              </div>

              <div style={{
                border: '2px solid #ffc107',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Active Testaments</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
                  {metrics.activeTestaments}
                </p>
              </div>

              <div style={{
                border: '2px solid #dc3545',
                borderRadius: '8px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Compliance Score</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>
                  {metrics.complianceScore}%
                </p>
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
