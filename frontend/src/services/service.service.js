import api from './api';

const serviceService = {
  getAll: async (adminMode = false) => {
    const { data } = await api.get('/services', { params: adminMode ? { admin: 'true' } : {} });
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/services', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/services/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/services/${id}`);
    return data;
  },

  reorder: async (items) => {
    const { data } = await api.patch('/services/reorder', { items });
    return data;
  },

  toggleStatus: async (id) => {
    const { data } = await api.patch(`/services/status/${id}`);
    return data;
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/services/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteImage: async (id) => {
    const { data } = await api.delete(`/services/${id}/image`);
    return data;
  },
};

export default serviceService;
