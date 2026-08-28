import api from './api';

const getAbout = async () => {
  const response = await api.get('/about');
  return response.data;
};

const updateAbout = async (data) => {
  const response = await api.put('/about', data);
  return response.data;
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/about/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const deleteImage = async () => {
  const response = await api.delete('/about/image');
  return response.data;
};

export default {
  getAbout,
  updateAbout,
  uploadImage,
  deleteImage,
};
