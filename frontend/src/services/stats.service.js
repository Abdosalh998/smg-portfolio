import api from './api';

const statsService = {
  getStats: async () => {
    const { data } = await api.get('/stats');
    return data;
  },
};

export default statsService;
