import { create } from 'zustand';
import { authAPI } from '../lib/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('stemverse_user') || 'null'),
  token: localStorage.getItem('stemverse_token') || null,
  loading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('stemverse_user', JSON.stringify(user));
    set({ user });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('stemverse_token', data.token);
      localStorage.setItem('stemverse_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Kirishda xatolik';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register({ name, email, password });
      localStorage.setItem('stemverse_token', data.token);
      localStorage.setItem('stemverse_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || "Ro'yxatdan o'tishda xatolik";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  fetchUser: async () => {
    try {
      const { data } = await authAPI.me();
      const { password, ...safe } = data;
      set({ user: safe });
      localStorage.setItem('stemverse_user', JSON.stringify(safe));
    } catch (err) {
      console.error(err);
    }
  },

  logout: () => {
    localStorage.removeItem('stemverse_token');
    localStorage.removeItem('stemverse_user');
    set({ user: null, token: null });
  },

  updateProfile: async (data) => {
    const res = await authAPI.updateProfile(data);
    set({ user: res.data });
    localStorage.setItem('stemverse_user', JSON.stringify(res.data));
    return res.data;
  },
}));

export default useAuthStore;
