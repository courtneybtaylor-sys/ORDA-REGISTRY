import React from 'react';
import SAIDTestamentStatus from '@/components/SAIDTestamentStatus';

export default function SaidAiotPage() {
  return (
    <main className="container">
      <h1>SAID-AIoT Testament Registry</h1>
      <p>Layer 5 infrastructure for immutable testimony and constitutional AI governance.</p>

      <SAIDTestamentStatus />

      <nav style={{ marginTop: '2rem' }}>
        <a href="/">&larr; Back to ORDA Registry</a>
      </nav>
    </main>
  );
}
