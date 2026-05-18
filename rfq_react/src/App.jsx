import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InquiryForm from './pages/InquiryForm';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import { authAPI } from './api/client';

export default function App() {
  const [page, setPage]         = useState('inquiry');
  const [isAdmin, setIsAdmin]   = useState(false);
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(true);

  
  useEffect(() => {
    authAPI.status()
      .then(r => {
        if (r.data.authenticated) {
          setIsAdmin(true);
          setUsername(r.data.username || 'Admin');
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  function handleLogin(uname) {
    setIsAdmin(true);
    setUsername(uname);
    setPage('dashboard');
  }

  function handleSetPage(p) {
    if (['admin','dashboard'].includes(p) && !isAdmin) { setPage('login'); return; }
    setPage(p);
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-3)' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar
        page={page}
        setPage={handleSetPage}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        username={username}
      />

      {page === 'inquiry'   && <InquiryForm />}
      {page === 'login'     && <Login onLogin={handleLogin} />}
      {page === 'admin'     && isAdmin && <AdminPanel />}
      {page === 'dashboard' && isAdmin && <Dashboard />}
    </div>
  );
}
