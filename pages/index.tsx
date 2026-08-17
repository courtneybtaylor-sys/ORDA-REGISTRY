import React, { useEffect, useState } from 'react';
import type { Metric } from '@/lib/types';
import ComplianceBar from '@/components/ComplianceBar';

export default function Home() {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/testament/${searchQuery}`;
    }
  };

  return (
    <main className="container">
      <h1>ORDA Registry</h1>
      <p>Digital Testament and Identity Ledger</p>

      <section style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search testament by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', maxWidth: '400px', fontFamily: 'var(--font-body)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>
            Search
          </button>
        </form>
      </section>

      <section>
        <h2>Registry Metrics</h2>
        {loading ? (
          <p>Loading metrics...</p>
        ) : metrics ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ maxWidth: 'none' }}>
              <p className="ui-label">Total Identities</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary-indigo)' }}>{metrics.totalIdentities}</p>
            </div>
            <div className="card" style={{ maxWidth: 'none' }}>
              <p className="ui-label">Total Testaments</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary-indigo)' }}>{metrics.totalTestaments}</p>
            </div>
            <div className="card" style={{ maxWidth: 'none' }}>
              <p className="ui-label">Active Testaments</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary-indigo)' }}>{metrics.activeTestaments}</p>
            </div>
            <div className="card" style={{ maxWidth: 'none' }}>
              <p className="ui-label">Compliance Score</p>
              <ComplianceBar score={metrics.complianceScore} />
            </div>
          </div>
        ) : (
          <p>Failed to load metrics</p>
        )}
      </section>

      <nav style={{ marginTop: '2rem' }}>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/identities">Identities</a></li>
          <li><a href="/docs">API Documentation</a></li>
        </ul>
      </nav>
    </main>
  );
}
