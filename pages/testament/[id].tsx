import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Testament } from '@/lib/types';

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
    return <main style={{ padding: '2rem' }}><p>Loading...</p></main>;
  }

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <a href="/">Back to home</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <a href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</a>

      {testament && (
        <article>
          <h1>Testament</h1>
          <div style={{ marginBottom: '2rem', color: '#666' }}>
            <p><strong>ID:</strong> {testament.id}</p>
            <p><strong>Identity ID:</strong> {testament.identityId}</p>
            <p><strong>Status:</strong> {testament.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Created:</strong> {new Date(testament.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(testament.updatedAt).toLocaleString()}</p>
          </div>

          <section>
            <h2>Content</h2>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {testament.content}
            </pre>
          </section>
        </article>
      )}
    </main>
  );
}
