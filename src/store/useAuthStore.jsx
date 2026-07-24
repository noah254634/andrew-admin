import { create } from 'zustand';
import api from '../api/axios';

const hasToken = () => !!localStorage.getItem('access_token');

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('access_token') || null,
  user: null,
  isAuthenticated: hasToken(),
  isLoading: hasToken(), // ONLY show loading if a saved token needs verification

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);

      set({
        token: access_token,
        user: user || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      if (!user) {
        await get().fetchUser();
      }

      return true;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        (err.code === 'ECONNABORTED'
          ? 'Connection timed out. Unable to reach backend server.'
          : 'Authentication failed. Please check your credentials.');
      set({ error: message, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (err) {
      get().logout();
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({
        token,
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      get().logout();
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));