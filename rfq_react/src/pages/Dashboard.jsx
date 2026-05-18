import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { dashboardAPI } from '../api/client';

function StatCard({ label, value, sub, accent }) {
  const colors = { amber: 'var(--orange)', green: 'var(--green)', blue: 'var(--blue)', default: 'var(--steel)' };
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.25rem 1.5rem', boxShadow: 'var(--sh)' }}>
      <div style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 600, color: colors[accent] || colors.default, margin: '.25rem 0', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{sub}</div>
    </div>
  );
}

function BarChart({ byStatus }) {
  const colors = { New: '#1d4ed8', Quoted: '#ea580c', Approved: '#16a34a', Rejected: '#dc2626' };
  const max = Math.max(...Object.values(byStatus), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {['New','Quoted','Approved','Rejected'].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-2)', minWidth: '70px', textAlign: 'right' }}>{s}</div>
          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '4px', height: '22px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.round((byStatus[s] || 0) / max * 100)}%`,
              height: '100%', background: colors[s], borderRadius: '4px',
              display: 'flex', alignItems: 'center', paddingLeft: '8px',
              fontSize: '11.5px', fontWeight: 600, color: '#fff',
              transition: 'width .6s cubic-bezier(.34,1.56,.64,1)',
              minWidth: byStatus[s] ? '24px' : '0',
            }}>
              {byStatus[s] || 0}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-2)', minWidth: '20px' }}>{byStatus[s] || 0}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const actColors = { New: '#1d4ed8', Quoted: '#ea580c', Approved: '#16a34a', Rejected: '#dc2626' };

  useEffect(() => {
    dashboardAPI.stats()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>Loading dashboard…</div>;
  if (!data)   return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--red)' }}>Failed to load dashboard</div>;

  const td = { padding: '.75rem 1rem', verticalAlign: 'middle', borderBottom: '1px solid var(--border)', fontSize: '13.5px' };
  const th = { padding: '.6rem 1rem', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--steel)' }}>Dashboard Overview</h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '3px' }}>
          As of {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Inquiries" value={data.total_inquiries} sub="All time" />
        <StatCard label="Quotations Sent" value={data.total_quoted}    sub="Quoted stage"    accent="amber" />
        <StatCard label="Approved Orders" value={data.total_approved}  sub="Converted"       accent="green" />
        <StatCard label="Pending Review"  value={data.total_new}       sub="Awaiting action" accent="blue"  />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <Card>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '1.25rem' }}>Status Breakdown</div>
          <BarChart byStatus={data.by_status || {}} />
        </Card>

        <Card>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Activity</div>
          {data.recent_inquiries.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '13px', textAlign: 'center', padding: '1rem' }}>No activity yet</p>
          ) : data.recent_inquiries.map(i => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: actColors[i.status], marginTop: '5px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 500 }}>{i.company_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {i.product} · <Badge status={i.status} /> · {fmtDate(i.created_at)}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Table */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>Latest Inquiries</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr>
                <th style={th}>Ref #</th>
                <th style={th}>Company</th>
                <th style={th}>Product</th>
                <th style={th}>Qty</th>
                <th style={th}>Status</th>
                <th style={th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_inquiries.length === 0 ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--text-3)' }}>No data yet</td></tr>
              ) : data.recent_inquiries.map(i => (
                <tr key={i.id}>
                  <td style={{ ...td, fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-3)' }}>{i.ref_number}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{i.company_name}</td>
                  <td style={td}>{i.product}</td>
                  <td style={td}>{Number(i.quantity).toLocaleString()}</td>
                  <td style={td}><Badge status={i.status} /></td>
                  <td style={{ ...td, color: 'var(--text-2)' }}>{fmtDate(i.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
