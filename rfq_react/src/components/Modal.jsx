import React from 'react';
import { useState } from 'react';
import Badge from './Badge';
import Button from './Button';
import { inquiryAPI } from '../api/client';

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, color: 'var(--text-3)' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'var(--text)' }}>{value || '—'}</div>
    </div>
  );
}

function Timeline({ status }) {
  const steps = ['New', 'Quoted', 'Approved'];
  const si = steps.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
      {steps.map((s, idx) => (
        <React.Fragment key={s}>
          {idx > 0 && (
            <div style={{ flex: 1, height: '2px', background: idx <= si ? 'var(--steel)' : 'var(--border)', marginTop: '-14px' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: idx === 0 || idx === steps.length - 1 ? 0 : 1 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600,
              border: '2px solid', zIndex: 1,
              borderColor: idx <= si ? (idx === si ? 'var(--amber)' : 'var(--steel)') : 'var(--border-strong)',
              background: idx < si ? 'var(--steel)' : idx === si ? 'var(--amber)' : '#fff',
              color: idx <= si ? '#fff' : 'var(--text-3)',
            }}>
              {idx < si ? '✓' : idx + 1}
            </div>
            <div style={{ fontSize: '11px', marginTop: '5px', fontWeight: 500, color: idx <= si ? 'var(--text)' : 'var(--text-3)' }}>{s}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Modal({ inquiry, onClose, onUpdated }) {
  const [tab, setTab]       = useState('details');
  const [loading, setLoading] = useState(false);
  const [price, setPrice]   = useState(inquiry.quotation?.unit_price || '');
  const [delivery, setDel]  = useState(inquiry.quotation?.delivery_time || '');
  const [terms, setTerms]   = useState(inquiry.quotation?.payment_terms || '50% Advance, 50% on Dispatch');
  const [notes, setNotes]   = useState(inquiry.quotation?.notes || '');

  const total = price && inquiry.quantity
    ? (parseFloat(price) * inquiry.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  async function saveQuote() {
    if (!price || parseFloat(price) <= 0) return alert('Enter a valid unit price');
    setLoading(true);
    try {
      await inquiryAPI.quote(inquiry.id, { unit_price: price, delivery_time: delivery, payment_terms: terms, notes });
      onUpdated('✓ Quotation saved successfully', 'success');
      onClose();
    } catch { onUpdated('Failed to save quotation', 'error'); }
    finally { setLoading(false); }
  }

  async function handleStatus(s) {
    setLoading(true);
    try {
      await inquiryAPI.status(inquiry.id, s);
      onUpdated(`✓ Status updated to "${s}"`, 'success');
      onClose();
    } catch { onUpdated('Status update failed', 'error'); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this inquiry? This cannot be undone.')) return;
    setLoading(true);
    try {
      await inquiryAPI.delete(inquiry.id);
      onUpdated('Inquiry deleted', 'success');
      onClose();
    } catch { onUpdated('Delete failed', 'error'); }
    finally { setLoading(false); }
  }

  const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtSize = b => { if (!b) return '—'; const k = b / 1024; return k > 1024 ? (k / 1024).toFixed(1) + ' MB' : Math.round(k) + ' KB'; };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,15,25,.55)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '580px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)',
        animation: 'slideUp .2s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{inquiry.company_name}</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '2px' }}>{inquiry.ref_number} · {fmtDate(inquiry.created_at)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-3)', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <Timeline status={inquiry.status} />
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            {['details', 'quotation'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '.35rem .75rem', borderRadius: 'var(--rs)', fontSize: '12.5px',
                fontWeight: 500, cursor: 'pointer', border: tab === t ? 'none' : '1px solid var(--border-strong)',
                background: tab === t ? 'var(--steel)' : '#fff',
                color: tab === t ? '#fff' : 'var(--text)',
              }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          {/* Details Tab */}
          {tab === 'details' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem 1.5rem' }}>
                <DetailRow label="Company"     value={inquiry.company_name} />
                <DetailRow label="Contact"     value={inquiry.contact_person} />
                <DetailRow label="Phone"       value={inquiry.phone} />
                <DetailRow label="Email"       value={inquiry.email} />
                <DetailRow label="Product"     value={inquiry.product} />
                <DetailRow label="Quantity"    value={Number(inquiry.quantity).toLocaleString() + ' units'} />
                <DetailRow label="Material"    value={inquiry.material} />
                <DetailRow label="Delivery"    value={inquiry.target_delivery ? new Date(inquiry.target_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
              </div>
              {inquiry.message && (
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--rs)', padding: '1rem', marginTop: '1rem' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, color: 'var(--text-3)', marginBottom: '.4rem' }}>Customer Message</div>
                  <div style={{ fontSize: '13.5px' }}>{inquiry.message}</div>
                </div>
              )}
              {inquiry.files?.length > 0 && (
                <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)', borderRadius: 'var(--rs)', padding: '.75rem 1rem', marginTop: '.75rem' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--blue)', marginBottom: '.4rem' }}>Attached Files</div>
                  {inquiry.files.map(f => (
                    <div key={f.id} style={{ fontSize: '13px', color: 'var(--blue)' }}>
                      📄 {f.original_name} <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>({fmtSize(f.file_size)})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quotation Tab */}
          {tab === 'quotation' && (
            <div>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--rs)', padding: '1rem', marginBottom: '1rem', fontSize: '13px', color: 'var(--text-2)' }}>
                Add quotation details. Status advances to <strong>Quoted</strong> on save.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-2)', display: 'block', marginBottom: '5px' }}>Unit Price (₹) *</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="145.50" min="0" step="0.01"
                    style={{ width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-2)', display: 'block', marginBottom: '5px' }}>Total Value (₹)</label>
                  <input readOnly value={total ? '₹ ' + total : ''} placeholder="Auto-calculated"
                    style={{ width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', background: 'var(--surface)', cursor: 'default' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-2)', display: 'block', marginBottom: '5px' }}>Delivery Time</label>
                  <input value={delivery} onChange={e => setDel(e.target.value)} placeholder="21 Working Days"
                    style={{ width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-2)', display: 'block', marginBottom: '5px' }}>Payment Terms</label>
                  <select value={terms} onChange={e => setTerms(e.target.value)}
                    style={{ width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', outline: 'none', background: '#fff' }}>
                    <option>50% Advance, 50% on Dispatch</option>
                    <option>100% Advance</option>
                    <option>30 Days Credit</option>
                    <option>60 Days Credit</option>
                    <option>LC at Sight</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-2)', display: 'block', marginBottom: '5px' }}>Internal Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Material sourcing, tooling notes…"
                  style={{ width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', resize: 'vertical', outline: 'none' }} />
              </div>

              {/* Status buttons */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--rs)', padding: '1rem' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: '.5rem' }}>Update Status</div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <Button variant="blue"   size="sm" onClick={() => handleStatus('New')}      loading={loading}>● New</Button>
                  <Button variant="orange" size="sm" onClick={() => handleStatus('Quoted')}   loading={loading}>● Quoted</Button>
                  <Button variant="green"  size="sm" onClick={() => handleStatus('Approved')} loading={loading}>✓ Approved</Button>
                  <Button variant="danger" size="sm" onClick={() => handleStatus('Rejected')} loading={loading}>✗ Rejected</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={loading} style={{ marginRight: 'auto' }}>Delete</Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {tab === 'quotation' && <Button variant="amber" onClick={saveQuote} loading={loading}>Save Quotation</Button>}
        </div>
      </div>
    </div>
  );
}
