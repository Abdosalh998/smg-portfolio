import api from './api';

const BASE = '/why-choose-us';

const getAll       = ()             => api.get(BASE).then(r => r.data);
const getAllAdmin   = ()             => api.get(`${BASE}?admin=true`).then(r => r.data);
const createItem   = (data)         => api.post(BASE, data).then(r => r.data);
const updateItem   = (id, data)     => api.put(`${BASE}/${id}`, data).then(r => r.data);
const deleteItem   = (id)           => api.delete(`${BASE}/${id}`).then(r => r.data);
const reorderItems = (items)        => api.patch(`${BASE}/reorder`, { items }).then(r => r.data);
const toggleStatus = (id)           => api.patch(`${BASE}/status/${id}`).then(r => r.data);

export default { getAll, getAllAdmin, createItem, updateItem, deleteItem, reorderItems, toggleStatus };
