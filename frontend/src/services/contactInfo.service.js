import api from './api';

const contactInfoService = {
  get: async () => {
    const res = await api.get('/contact-information');
    return res.data;
  },
  update: async (data) => {
    const res = await api.put('/contact-information', data);
    return res.data;
  },
};

export default contactInfoService;
