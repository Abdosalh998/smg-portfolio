const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const form = new FormData();
    // Use any dummy file, for example server.js just as a buffer, but it must be an image type or multer will reject it
    // Wait, multer fileFilter requires 'image/jpeg', 'image/png', or 'image/webp'
    // I can just send a valid image type buffer
    form.append('images', Buffer.from('dummy image data'), {
      filename: 'test.png',
      contentType: 'image/png'
    });

    // To hit protected route, I need a token. Or I can just check if it returns 401. If it returns 401, it means the route is hit. 
    const res = await axios.post('http://localhost:5000/api/gallery', form, {
      headers: form.getHeaders(),
      validateStatus: () => true
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error(err);
  }
}
testUpload();
