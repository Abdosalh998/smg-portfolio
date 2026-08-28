const express = require('express');
const router = express.Router();
const { getAbout, updateAbout, uploadImage, deleteImage } = require('../controllers/about.controller');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public route
router.get('/', getAbout);

// Protected routes
router.put('/', protect, updateAbout);
router.post('/upload-image', protect, upload.single('image'), uploadImage);
router.delete('/image', protect, deleteImage);

module.exports = router;
