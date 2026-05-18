import React from 'react';

const variants = {
  primary: { background: 'var(--steel)',      color: '#fff',           border: 'none'                                 },
  amber:   { background: 'var(--amber)',      color: '#fff',           border: 'none'                                 },
  outline: { background: '#fff',              color: 'var(--text)',    border: '1px solid var(--border-strong)'       },
  danger:  { background: 'var(--red-bg)',     color: 'var(--red)',     border: '1px solid var(--red-bd)'              },
  green:   { background: 'var(--green-bg)',   color: 'var(--green)',   border: '1px solid var(--green-bd)'            },
  blue:    { background: 'var(--blue-bg)',    color: 'var(--blue)',    border: '1px solid var(--blue-bd)'             },
  orange:  { background: 'var(--orange-bg)',  color: 'var(--orange)',  border: '1px solid var(--orange-bd)'           },
};

export default function Button({ children, variant = 'primary', size = 'md', full = false, loading = false, onClick, disabled, style = {} }) {
  const v = variants[variant] || variants.primary;
  const pad = size === 'sm' ? '.35rem .75rem' : size === 'lg' ? '.75rem 1.5rem' : '.6rem 1.25rem';
  const fs  = size === 'sm' ? '12.5px' : size === 'lg' ? '15px' : '14px';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...v, padding: pad, borderRadius: 'var(--rs)', fontSize: fs,
        fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        width: full ? '100%' : 'auto', justifyContent: full ? 'center' : 'flex-start',
        opacity: disabled || loading ? .6 : 1, transition: 'all .15s',
        whiteSpace: 'nowrap', ...style,
      }}
    >
      {loading ? <span className="spinner" /> : null}
      {children}
    </button>
  );
}
