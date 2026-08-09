import React, { useState } from 'react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { authAPI } from '../api/client';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState({ type: '', message: '' });

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      onLogin(res.data.username);
    } catch(e) {
      setAlert({ type: 'error', message: e.response?.data?.error || 'Login failed' });
    } finally { setLoading(false); }
  }

  const inputStyle = { width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', outline: 'none', marginTop: '5px' };

  return (
    <div className="mobile-pad" style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--steel)' }}>
      <div className="mobile-pad" style={{ background: '#fff', borderRadius: '16px', padding: '3rem 2.5rem', width: '100%', maxWidth: '400px', boxShadow: 'var(--shm)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--steel)', color: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 1rem' }}>⚙</div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--steel)' }}>Admin Portal</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '3px' }}>Press Stamping Industries — RFQ System</p>
        </div>

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type:'', message:'' })} />

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Username</label>
          <input style={inputStyle} value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" />
        </div>

        <Button variant="primary" size="lg" full loading={loading} onClick={handleLogin}>Sign In</Button>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>Default: admin / admin123</div>
      </div>
    </div>
  );
}
