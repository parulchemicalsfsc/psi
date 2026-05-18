import React from 'react';

const config = {
  New:      { bg: 'var(--blue-bg)',   color: 'var(--blue)',   border: 'var(--blue-bd)'   },
  Quoted:   { bg: 'var(--orange-bg)', color: 'var(--orange)', border: 'var(--orange-bd)' },
  Approved: { bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'var(--green-bd)'  },
  Rejected: { bg: 'var(--red-bg)',    color: 'var(--red)',    border: 'var(--red-bd)'    },
};

export default function Badge({ status }) {
  const c = config[status] || config.New;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '.2rem .65rem',
      borderRadius: '20px', fontSize: '11.5px', fontWeight: 500,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {status}
    </span>
  );
}
