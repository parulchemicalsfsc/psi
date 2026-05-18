import React from 'react';

export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--r)', padding: '1.5rem',
      boxShadow: 'var(--sh)', ...style,
    }}>
      {children}
    </div>
  );
}
