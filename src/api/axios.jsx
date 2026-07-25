import axios from 'axios';

export const DEFAULT_RENDER_API_URL = 'https://andrew-portfolio-backend-z42h.onrender.com/api/v1';

export const getApiBaseURL = () => {
  const customUrl = localStorage.getItem('custom_api_url');
  if (customUrl) {
    return customUrl.endsWith('/api/v1') ? customUrl : `${customUrl.replace(/\/$/, '')}/api/v1`;
  }

  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/$/, '')}/api/v1`;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Local device testing via LAN IP (e.g. 192.168.x.x:5173 -> point to port 8000)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return `${protocol}//${hostname}:8000/api/v1`;
  }

  // Localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api/v1';
  }

  // Production Vercel / Cloud Domain -> Fallback to Actual Render Backend URL
  return DEFAULT_RENDER_API_URL;
};

// Formats image URLs dynamically so localhost, relative paths, or Cloudflare R2 links work on phones
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://127.0.0.1:8000') || url.startsWith('http://localhost:8000')) {
    const relativePath = url.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, '');
    const apiBase = getApiBaseURL().replace(/\/api\/v1\/?$/, '');
    return `${apiBase}${relativePath}`;
  }
  if (url.startsWith('/static/')) {
    const apiBase = getApiBaseURL().replace(/\/api\/v1\/?$/, '');
    return `${apiBase}${url}`;
  }
  return url;
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request Interceptor: Inject JWT Token & dynamic Base URL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseURL();
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default api;