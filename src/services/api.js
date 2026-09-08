import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Some endpoints return HTTP 200 with an explicit { success: false } body
    // (a "soft" failure). Axios does NOT reject those, so without this a caller's
    // try/catch never fires and the UI silently proceeds as if it worked. Turn a
    // definitive success:false into a rejection shaped like a normal Axios error
    // so existing `err.response?.data?.message` handling surfaces it.
    // NOTE: only reject on `success === false`. Bulk endpoints return
    // { success: true, results, errors } for PARTIAL failures — those must stay
    // resolved so callers can report per-row errors themselves.
    const data = response?.data;
    if (data && typeof data === 'object' && data.success === false) {
      const err = new Error(data.message || 'Request failed');
      err.response = response;
      err.isSoftFail = true;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
