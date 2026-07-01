import axios from 'axios';

const API_URL = 'https://stemverse-production.up.railway.app';  // ← Railway backend

const api = axios.create({ 
  baseURL: API_URL + '/api', 
  headers: { 'Content-Type': 'application/json' } 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('voltra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem('voltra_token');
      localStorage.removeItem('voltra_user');
      if (window.location.pathname !== '/auth/login') window.location.href = '/auth/login';
    }
    return Promise.reject(e);
  }
);

export default api;
export const authAPI = { register: (d) => api.post('/auth/register', d), login: (d) => api.post('/auth/login', d), me: () => api.get('/auth/me'), updateProfile: (d) => api.put('/auth/profile', d) };
export const kitAPI = { activate: (code) => api.post('/kit/activate', { code }), myKit: () => api.get('/kit/my-kit') };
export const lessonsAPI = { list: () => api.get('/lessons'), get: (id) => api.get(`/lessons/${id}`) };
export const progressAPI = { complete: (lid, s) => api.post('/progress/complete', { lessonId: lid, score: s }), overview: () => api.get('/progress/overview') };
export const achievementsAPI = { list: () => api.get('/achievements') };
export const adminAPI = { createLesson: (d) => api.post('/admin/lessons', d), updateLesson: (id, d) => api.put(`/admin/lessons/${id}`, d), deleteLesson: (id) => api.delete(`/admin/lessons/${id}`), generateCodes: (c) => api.post('/admin/codes/generate', { count: c }), listCodes: () => api.get('/admin/codes'), stats: () => api.get('/admin/stats'), users: () => api.get('/admin/users') };
export const teacherAPI = { classrooms: () => api.get('/teacher/classrooms'), createClassroom: (name) => api.post('/teacher/classrooms', { name }), getClassroom: (id) => api.get(`/teacher/classrooms/${id}`), deleteClassroom: (id) => api.delete(`/teacher/classrooms/${id}`), join: (code) => api.post('/teacher/join', { code }), stats: () => api.get('/teacher/stats') };
export const orderAPI = { create: (d) => api.post('/orders', d), list: () => api.get('/orders'), updateStatus: (id, status) => api.patch(`/orders/${id}`, { status }) };
