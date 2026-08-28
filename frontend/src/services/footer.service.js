import api from './api';

const footerService = {
  get: async () => {
    const res = await api.get('/footer');
    return res.data;
  },
  update: async (data) => {
    const res = await api.put('/footer', data);
    return res.data;
  },
};

export default footerService;
