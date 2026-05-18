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
  submit: (formData) => api.post("/inquiries/submit/", formData),
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
