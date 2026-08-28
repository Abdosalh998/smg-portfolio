import api from './api';

const settingsService = {
  get: async () => {
    const res = await api.get('/website-settings');
    return res.data;
  },
  update: async (data) => {
    const res = await api.put('/website-settings', data);
    return res.data;
  },
  uploadMedia: async (file, field) => {
    const formData = new FormData();
    formData.append('image', file); // Multer uses 'image' based on our routes configuration
    formData.append('field', field); // 'logo' or 'favicon'

    const res = await api.post('/website-settings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default settingsService;
