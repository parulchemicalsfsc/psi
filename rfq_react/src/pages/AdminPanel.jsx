import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { inquiryAPI } from '../api/client';

const th = { padding: '.6rem 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' };
const td = { padding: '.75rem 1rem', verticalAlign: 'middle', borderBottom: '1px solid var(--border)' };

export default function AdminPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [count, setCount]         = useState(0);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [sort, setSort]           = useState('-created_at');
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [alert, setAlert]         = useState({ type: '', message: '' });

  const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inquiryAPI.list({ search, status, sort });
      setInquiries(res.data.results);
      setCount(res.data.count);
    } catch { setAlert({ type: 'error', message: 'Failed to load inquiries' }); }
    finally { setLoading(false); }
  }, [search, status, sort]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load]);

  async function openDetail(id) {
    try {
      const res = await inquiryAPI.detail(id);
      setSelected(res.data);
    } catch { setAlert({ type: 'error', message: 'Failed to load inquiry' }); }
  }

  function handleUpdated(msg, type) {
    setAlert({ type, message: msg });
    load();
  }

  async function doExport() {
    try {
      const res = await inquiryAPI.exportCSV({ search, status });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `PSI_RFQ_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setAlert({
        type: "error",
        message: "Export failed — make sure you are logged in",
      });
    }
  }

  return (
    <div className="mobile-pad" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--steel)' }}>Inquiry Management</h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '3px' }}>View, filter and manage all incoming customer RFQs</p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type:'', message:'' })} />

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>All Inquiries</div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>{count} total</div>
          </div>
          <Button variant="outline" size="sm" onClick={doExport}>⬇ Export CSV</Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search company, product…"
            style={{ padding: '.5rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '13.5px', outline: 'none', minWidth: '200px' }}
          />
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ padding: '.5rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '13.5px', background: '#fff', outline: 'none' }}>
            <option value="">All Status</option>
            <option>New</option><option>Quoted</option><option>Approved</option><option>Rejected</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '.5rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '13.5px', background: '#fff', outline: 'none' }}>
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="company_name">Company A–Z</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Company</th>
                <th style={th}>Contact</th>
                <th style={th}>Product</th>
                <th style={th}>Qty</th>
                <th style={th}>Date</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--text-3)', padding: '3rem' }}>Loading…</td></tr>
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--text-3)', padding: '3rem' }}>No inquiries found</td></tr>
              ) : inquiries.map(i => (
                <tr key={i.id} style={{ transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...td, fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-3)' }}>{i.ref_number}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{i.company_name}</td>
                  <td style={{ ...td, color: 'var(--text-2)' }}>
                    {i.contact_person}<br />
                    <span style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>{i.email}</span>
                  </td>
                  <td style={td}>{i.product}</td>
                  <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{Number(i.quantity).toLocaleString()}</td>
                  <td style={{ ...td, fontSize: '12.5px', color: 'var(--text-2)' }}>{fmtDate(i.created_at)}</td>
                  <td style={td}><Badge status={i.status} /></td>
                  <td style={td}>
                    <Button variant="outline" size="sm" onClick={() => openDetail(i.id)}>View / Quote</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <Modal
          inquiry={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
