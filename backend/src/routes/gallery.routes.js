const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', galleryController.getAll);

// Protected routes
router.use(protect);

router.post('/', upload.array('images', 20), galleryController.createItems); // Allow up to 20 images at once
router.patch('/reorder', galleryController.reorderItems);
router.patch('/:id/status', galleryController.toggleStatus);
router.put('/:id', galleryController.updateItem);
router.patch('/:id/image', upload.single('image'), galleryController.replaceImage);
router.delete('/:id', galleryController.deleteItem);

module.exports = router;
