const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadDoc } = require('../middleware/upload');
const {
  getAll, getById, createItem, updateItem, deleteItem,
  reorderItems, toggleStatus,
  uploadMainImage, uploadGalleryImages, deleteGalleryImage,
  uploadDatasheet, deleteDatasheet
} = require('../controllers/product.controller');

// Public
router.get('/', getAll);
router.get('/:id', getById);

// Protected CRUD
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

// Reorder & Status
router.patch('/reorder', protect, reorderItems);
router.patch('/status/:id', protect, toggleStatus);

// Files (Images)
router.post('/:id/main-image', protect, upload.single('image'), uploadMainImage);
router.post('/:id/gallery', protect, upload.array('images', 10), uploadGalleryImages); // Max 10 images at once
router.delete('/:id/gallery', protect, deleteGalleryImage); // Provide imagePath in body

// Files (PDF)
router.post('/:id/datasheet', protect, uploadDoc.single('datasheet'), uploadDatasheet);
router.delete('/:id/datasheet', protect, deleteDatasheet);

module.exports = router;
