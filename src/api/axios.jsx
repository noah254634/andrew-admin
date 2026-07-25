import axios from 'axios';

export const DEFAULT_RENDER_API_URL = 'https://andrew-portfolio-backend.onrender.com/api/v1';

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

  // Production Vercel / Cloud Domain -> Fallback to Render Backend
  return DEFAULT_RENDER_API_URL;
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