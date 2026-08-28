import api from './api';

const galleryService = {
  /**
   * Get all gallery items
   * @param {boolean} admin - If true, fetches all items including inactive ones
   */
  getAll: async (admin = false) => {
    const res = await api.get(`/gallery${admin ? '?admin=true' : ''}`);
    return res.data;
  },

  /**
   * Create multiple gallery items by uploading images
   * @param {FileList|File[]} files - Images to upload
   */
  createItems: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    const res = await api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Update gallery item details (title, location, description)
   * @param {string} id - Item ID
   * @param {Object} data - Updated fields
   */
  updateItem: async (id, data) => {
    const res = await api.put(`/gallery/${id}`, data);
    return res.data;
  },

  /**
   * Replace the image of a gallery item
   * @param {string} id - Item ID
   * @param {File} file - New image
   */
  replaceImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.patch(`/gallery/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Delete a gallery item
   * @param {string} id - Item ID
   */
  deleteItem: async (id) => {
    const res = await api.delete(`/gallery/${id}`);
    return res.data;
  },

  /**
   * Toggle gallery item active status
   * @param {string} id - Item ID
   */
  toggleStatus: async (id) => {
    const res = await api.patch(`/gallery/${id}/status`);
    return res.data;
  },

  /**
   * Reorder gallery items
   * @param {Array<{id: string, order: number}>} items - Array of items with new order
   */
  reorderItems: async (items) => {
    const res = await api.patch('/gallery/reorder', { items });
    return res.data;
  },
};

export default galleryService;
