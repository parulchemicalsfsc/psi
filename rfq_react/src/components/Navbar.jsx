import React from 'react';
import { authAPI } from '../api/client';

const styles = {
  nav: { background: 'var(--steel)', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 2rem', height: '60px', gap: '1.5rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,.25)' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 600, color: '#fff', textDecoration: 'none', marginRight: 'auto' },
  mark: { width: '34px', height: '34px', background: 'var(--amber)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  tabs: { display: 'flex', gap: '.2rem' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff' },
  userRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,.75)' },
};

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '.4rem .9rem', borderRadius: 'var(--rs)', cursor: 'pointer',
      fontSize: '13.5px', fontWeight: 500, border: 'none',
      background: active ? 'rgba(255,255,255,.14)' : 'none',
      color: active ? '#fff' : 'rgba(255,255,255,.6)',
      transition: 'all .15s', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

export default function Navbar({ page, setPage, isAdmin, setIsAdmin, username }) {
  async function handleLogout() {
    await authAPI.logout();
    setIsAdmin(false);
    setPage('inquiry');
  }

  return (
    <nav style={styles.nav}>
      <a style={styles.brand} href="#">
        <div style={styles.mark}>⚙</div>
        Press Stamping Industries
      </a>

      <div style={styles.tabs}>
        <NavTab label="New Inquiry" active={page === 'inquiry'} onClick={() => setPage('inquiry')} />
        {isAdmin && <NavTab label="Admin Panel"  active={page === 'admin'}     onClick={() => setPage('admin')} />}
        {isAdmin && <NavTab label="Dashboard"    active={page === 'dashboard'} onClick={() => setPage('dashboard')} />}
      </div>

      <div>
        {isAdmin ? (
          <div style={styles.userRow}>
            <div style={styles.avatar}>A</div>
            <span>{username || 'Admin'}</span>
            <button onClick={handleLogout} style={{
              marginLeft: '.5rem', padding: '.3rem .75rem', borderRadius: 'var(--rs)',
              background: 'none', border: '1px solid rgba(255,255,255,.2)',
              color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: '13px',
            }}>Logout</button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
