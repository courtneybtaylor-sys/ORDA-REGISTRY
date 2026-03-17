import React from 'react';

export default function ApiDocs() {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>API Documentation</h1>

      <nav style={{ marginBottom: '2rem' }}>
        <a href="/" style={{ marginRight: '1rem' }}>← Back to Home</a>
      </nav>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Base URL</h2>
        <code>{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}</code>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Endpoints</h2>

        <article style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h3>GET /api/metrics</h3>
          <p>Retrieve registry metrics and statistics</p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '0.75rem', borderRadius: '4px' }}>
{`Response:
{
  "success": true,
  "data": {
    "totalIdentities": 42,
    "totalTestaments": 156,
    "activeTestaments": 140,
    "complianceScore": 95,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}`}
          </pre>
        </article>

        <article style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h3>GET /api/identities</h3>
          <p>List all identities with pagination</p>
          <p><strong>Query Parameters:</strong></p>
          <ul>
            <li><code>page</code> (default: 1) - Page number</li>
            <li><code>limit</code> (default: 20, max: 100) - Items per page</li>
          </ul>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '0.75rem', borderRadius: '4px' }}>
{`Response:
{
  "success": true,
  "data": [
    {
      "id": "identity-uuid",
      "publicKey": "pk_...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "testamentCount": 3
    }
  ],
  "message": "Retrieved X identities"
}`}
          </pre>
        </article>

        <article style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h3>GET /api/testament/[id]</h3>
          <p>Retrieve a specific testament</p>
          <p><strong>Path Parameters:</strong></p>
          <ul>
            <li><code>id</code> - Testament UUID</li>
          </ul>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '0.75rem', borderRadius: '4px' }}>
{`Response:
{
  "success": true,
  "data": {
    "id": "testament-uuid",
    "identityId": "identity-uuid",
    "content": "Testament content...",
    "timestamp": "2024-01-15T10:00:00Z",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}`}
          </pre>
        </article>

        <article style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h3>POST /api/testament/log</h3>
          <p>Create a new testament</p>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '0.75rem', borderRadius: '4px' }}>
{`Request Body:
{
  "identityId": "identity-uuid",
  "content": "Testament content..."
}

Response:
{
  "success": true,
  "data": {
    "id": "testament-uuid",
    "identityId": "identity-uuid",
    "content": "Testament content...",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Testament logged successfully"
}`}
          </pre>
        </article>

        <article style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h3>GET /api/compliance</h3>
          <p>Retrieve compliance records for all identities</p>
          <p><strong>Query Parameters:</strong></p>
          <ul>
            <li><code>page</code> (default: 1) - Page number</li>
            <li><code>limit</code> (default: 20, max: 100) - Items per page</li>
          </ul>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '0.75rem', borderRadius: '4px' }}>
{`Response:
{
  "success": true,
  "data": [
    {
      "identityId": "identity-uuid",
      "identityName": "John Doe",
      "testamentCount": 3,
      "lastTestamentDate": "2024-01-15T10:00:00Z",
      "complianceStatus": "compliant",
      "notes": "Optional notes"
    }
  ],
  "message": "Retrieved compliance records for X identities"
}`}
          </pre>
        </article>
      </section>

      <section>
        <h2>Error Handling</h2>
        <p>All endpoints return a standard error response format:</p>
        <pre style={{ backgroundColor: '#ffe0e0', padding: '0.75rem', borderRadius: '4px' }}>
{`{
  "success": false,
  "error": "Error description"
}`}
        </pre>
      </section>
    </main>
  );
}
