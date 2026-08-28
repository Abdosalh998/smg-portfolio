import api from './api';

const productService = {
  getAll: async (adminMode = false) => {
    const { data } = await api.get('/products', { params: adminMode ? { admin: 'true' } : {} });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/products', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  reorder: async (items) => {
    const { data } = await api.patch('/products/reorder', { items });
    return data;
  },

  toggleStatus: async (id) => {
    const { data } = await api.patch(`/products/status/${id}`);
    return data;
  },

  uploadMainImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/products/${id}/main-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  uploadGalleryImages: async (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    const { data } = await api.post(`/products/${id}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteGalleryImage: async (id, imagePath) => {
    const { data } = await api.delete(`/products/${id}/gallery`, {
      data: { imagePath },
    });
    return data;
  },

  uploadDatasheet: async (id, file) => {
    const formData = new FormData();
    formData.append('datasheet', file);
    const { data } = await api.post(`/products/${id}/datasheet`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteDatasheet: async (id) => {
    const { data } = await api.delete(`/products/${id}/datasheet`);
    return data;
  },
};

export default productService;
