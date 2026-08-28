import api from './api';

const authService = {
  login: async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* silently fail — client-side cleanup is what matters */ }
    localStorage.removeItem('smg_token');
    localStorage.removeItem('smg_user');
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

export default authService;
