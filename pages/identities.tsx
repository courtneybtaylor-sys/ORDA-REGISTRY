import React, { useEffect, useState } from 'react';
import type { Identity } from '@/lib/types';

export default function IdentitiesPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchIdentities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/identities?page=${page}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          setIdentities(data.data?.items || []);
        }
      } catch (error) {
        console.error('Error fetching identities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdentities();
  }, [page]);

  return (
    <main className="container">
      <h1>Identity Ledger</h1>

      <nav style={{ marginBottom: '2rem' }}>
        <a href="/">&larr; Back to Home</a>
      </nav>

      {loading ? (
        <p>Loading identities...</p>
      ) : identities.length > 0 ? (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-light)', borderBottom: '2px solid var(--secondary-indigo)' }}>
                <th className="ui-label" style={{ padding: '0.75rem', textAlign: 'left' }}>DID</th>
                <th className="ui-label" style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                <th className="ui-label" style={{ padding: '0.75rem', textAlign: 'left' }}>Jurisdiction</th>
                <th className="ui-label" style={{ padding: '0.75rem', textAlign: 'center' }}>Testaments</th>
                <th className="ui-label" style={{ padding: '0.75rem', textAlign: 'left' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {identities.map((identity) => (
                <tr key={identity.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td className="mono" style={{ padding: '0.75rem' }}>{identity.operatorDid}</td>
                  <td style={{ padding: '0.75rem' }}>{identity.name}</td>
                  <td style={{ padding: '0.75rem' }}>{identity.jurisdiction || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{identity.testamentCount}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(identity.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center' }}>Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={identities.length < 20}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p>No identities found</p>
      )}
    </main>
  );
}
