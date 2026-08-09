import React, { useState, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { inquiryAPI } from '../api/client';

const field = (label, el) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
    <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</label>
    {el}
  </div>
);

const inputStyle = { padding: '.6rem .85rem', border: '1px solid var(--border)', borderRadius: 'var(--rs)', fontSize: '14px', color: 'var(--text)', background: '#fff', outline: 'none', width: '100%' };

export default function InquiryForm() {
  const [form, setForm] = useState({ company_name:'', contact_person:'', phone:'', email:'', product:'', quantity:'', material:'', target_delivery:'', message:'' });
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState({ type: '', message: '' });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  function handleFiles(fileList) {
    setFiles(Array.from(fileList));
  }

  async function handleSubmit() {
    const required = ['company_name','contact_person','phone','email','product','quantity'];
    if (required.some(k => !form[k].toString().trim())) {
      setAlert({ type: 'error', message: 'Please fill all required (*) fields' }); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setAlert({ type: 'error', message: 'Enter a valid email address' }); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      files.forEach(f => fd.append('files', f));
      const res = await inquiryAPI.submit(fd);
      
      setAlert({ type: 'success', message: `✓ Submitted successfully! Reference: ${res.data.ref_number}` });
      setForm({ company_name:'', contact_person:'', phone:'', email:'', product:'', quantity:'', material:'', target_delivery:'', message:'' });
      setFiles([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
      const errs = e.response?.data?.errors;
      setAlert({ type: 'error', message: errs ? Object.values(errs).flat().join(' ') : 'Submission failed. Please try again.' });
    } finally { setLoading(false); }
  }

  return (
    <div className="mobile-pad" style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--steel)' }}>Request for Quotation</h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '3px' }}>Fill in your inquiry details. Our team will respond within 24 business hours.</p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type:'', message:'' })} />

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>Customer Inquiry Form</div>
            <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Fields marked * are required</div>
          </div>
          <span style={{ display: 'inline-flex', padding: '.2rem .65rem', borderRadius: '20px', fontSize: '11.5px', fontWeight: 500, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-bd)' }}>New RFQ</span>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)', marginBottom: '.75rem' }}>Company Information</div>
        <div className="grid-2">
          {field('Company Name *', <input style={inputStyle} value={form.company_name} onChange={set('company_name')} placeholder="e.g. Tata Steel Ltd." />)}
          {field('Contact Person *', <input style={inputStyle} value={form.contact_person} onChange={set('contact_person')} placeholder="Full name" />)}
        </div>
        <div className="grid-2">
          {field('Phone Number *', <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" type="tel" />)}
          {field('Email Address *', <input style={inputStyle} value={form.email} onChange={set('email')} placeholder="contact@company.com" type="email" />)}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)', marginBottom: '.75rem' }}>Product Details</div>
        <div className="grid-2">
          {field('Product / Part Name *', <input style={inputStyle} value={form.product} onChange={set('product')} placeholder="e.g. Stamped Bracket" />)}
          {field('Quantity Required *', <input style={inputStyle} value={form.quantity} onChange={set('quantity')} placeholder="e.g. 5000" type="number" min="1" />)}
        </div>
        <div className="grid-2">
          {field('Material', (
            <select style={{ ...inputStyle, background: '#fff' }} value={form.material} onChange={set('material')}>
              <option value="">Select material</option>
              <option>Mild Steel (MS)</option>
              <option>Stainless Steel (SS)</option>
              <option>Aluminium</option>
              <option>Galvanized Steel</option>
              <option>Copper / Brass</option>
              <option>Custom / Other</option>
            </select>
          ))}
          {field('Target Delivery', <input style={inputStyle} value={form.target_delivery} onChange={set('target_delivery')} type="date" />)}
        </div>
        {field('Message / Special Requirements', (
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder="Tolerances, surface finish, packaging…" />
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)', marginBottom: '.75rem' }}>Attachments</div>

        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--steel)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--r)', padding: '2rem', textAlign: 'center',
            cursor: 'pointer', background: dragOver ? '#f0f2f7' : 'var(--surface)', transition: 'all .15s',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '.5rem' }}>📎</div>
          <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>Click to attach files or drag & drop</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>PDF, DWG, DXF, STEP, PNG, JPG — max 20 MB</div>
          {files.length > 0 && (
            <div style={{ marginTop: '.75rem', fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
              📄 {files.map(f => f.name).join(', ')}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,.dwg,.dxf,.step,.stp,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" loading={loading} onClick={handleSubmit}>✦ Submit Request for Quotation</Button>
          <Button variant="outline" size="lg" onClick={() => { setForm({ company_name:'',contact_person:'',phone:'',email:'',product:'',quantity:'',material:'',target_delivery:'',message:'' }); setFiles([]); }}>Clear</Button>
        </div>
      </Card>

      <div style={{ marginTop: '1rem', fontSize: '12.5px', color: 'var(--text-3)', textAlign: 'center' }}>
        🔒 Your data is handled securely. We will reach out via the provided email.
      </div>
    </div>
  );
}
