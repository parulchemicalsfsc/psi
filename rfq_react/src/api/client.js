import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach CSRF token to every mutating request
api.interceptors.request.use(async (config) => {
  if (['post','put','patch','delete'].includes(config.method)) {
    let token = getCookie('csrftoken');
    if (!token) {
      try {
        const r = await axios.get('/api/csrf/', { withCredentials: true });
        token = r.data.csrfToken || getCookie('csrftoken');
      } catch {}
    }
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});

function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}

export default api;

// ── Named API calls ───────────────────────────────────────────────────────────
export const authAPI = {
  login:  (data)  => api.post('/auth/login/', data),
  logout: ()      => api.post('/auth/logout/'),
  status: ()      => api.get('/auth/status/'),
};

export const inquiryAPI = {
  submit: async (formData) => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Fallback to Django endpoint if Supabase keys are not configured
      return api.post("/inquiries/submit/", formData);
    }

    // Convert FormData to a JSON object for Supabase inquiries table
    const data = {};
    formData.forEach((value, key) => {
      if (key !== 'files') {
        data[key] = value;
      }
    });

    // Generate ref_number locally if not present (to match backend behavior)
    if (!data.ref_number) {
      const ts = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      data.ref_number = `RFQ-${ts}-${suffix}`;
    }

    // Convert quantity to number
    if (data.quantity) {
      data.quantity = parseInt(data.quantity, 10);
    }

    // Post inquiry metadata to Supabase 'inquiries' table
    const inquiryRes = await axios.post(`${supabaseUrl}/rest/v1/inquiries`, data, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const inquiry = inquiryRes.data[0];

    // Handle files if there are any
    const files = formData.getAll('files');
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // 1. Upload file binary to Supabase Storage bucket 'inquiry-files'
          // Path structure: <inquiry_id>/<file_name>
          const storagePath = `${inquiry.id}/${file.name}`;
          await axios.post(
            `${supabaseUrl}/storage/v1/object/inquiry-files/${storagePath}`,
            file,
            {
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': file.type
              }
            }
          );

          // 2. Insert record into 'inquiry_files' table (matching Django DB schema)
          await axios.post(
            `${supabaseUrl}/rest/v1/inquiry_files`,
            {
              inquiry_id: inquiry.id,
              file: `inquiry_files/${storagePath}`,
              original_name: file.name,
              file_size: file.size
            },
            {
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (fileErr) {
          console.error("Failed to upload file to Supabase:", file.name, fileErr);
        }
      }
    }

    return {
      data: inquiry
    };
  },
  list: (params) => api.get("/inquiries/", { params }),
  detail: (id) => api.get(`/inquiries/${id}/`),
  delete: (id) => api.delete(`/inquiries/${id}/`),
  status: (id, status) => api.patch(`/inquiries/${id}/status/`, { status }),
  quote: (id, data) => api.post(`/inquiries/${id}/quotation/`, data),
  exportCSV: (params) => api.get("/export/csv/", { params, responseType: "blob" }),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/'),
};
