import api from './api';

const inboxService = {
  getAll: async ({ page = 1, limit = 20, search = '', isRead = '' } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (isRead !== '') params.isRead = isRead;
    const res = await api.get('/inbox', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/inbox/${id}`);
    return res.data;
  },

  markRead: async (id) => {
    const res = await api.patch(`/inbox/read/${id}`);
    return res.data;
  },

  markUnread: async (id) => {
    const res = await api.patch(`/inbox/unread/${id}`);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/inbox/${id}`);
    return res.data;
  },

  bulkMarkRead: async (ids) => {
    const res = await api.post('/inbox/bulk-read', { ids });
    return res.data;
  },

  bulkDelete: async (ids) => {
    const res = await api.post('/inbox/bulk-delete', { ids });
    return res.data;
  },

  // Public submit
  send: async (formData) => {
    const res = await api.post('/inbox/send', formData);
    return res.data;
  },
};

export default inboxService;
