import React, { useEffect } from 'react';

export default function Alert({ type, message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const styles = {
    success: { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-bd)' },
    error:   { background: 'var(--red-bg)',   color: 'var(--red)',   border: '1px solid var(--red-bd)'   },
  };

  return (
    <div style={{
      ...styles[type], padding: '.85rem 1.25rem', borderRadius: 'var(--rs)',
      fontSize: '13.5px', marginBottom: '1rem', display: 'flex',
      alignItems: 'center', gap: '8px', animation: 'fadeIn .25s',
    }}>
      {message}
    </div>
  );
}
