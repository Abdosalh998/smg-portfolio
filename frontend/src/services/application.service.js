import api from './api';

const applicationService = {
  getAll: async (adminMode = false) => {
    const { data } = await api.get('/applications', { params: adminMode ? { admin: 'true' } : {} });
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/applications', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/applications/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/applications/${id}`);
    return data;
  },

  reorder: async (items) => {
    const { data } = await api.patch('/applications/reorder', { items });
    return data;
  },

  toggleStatus: async (id) => {
    const { data } = await api.patch(`/applications/status/${id}`);
    return data;
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/applications/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteImage: async (id) => {
    const { data } = await api.delete(`/applications/${id}/image`);
    return data;
  },
};

export default applicationService;
