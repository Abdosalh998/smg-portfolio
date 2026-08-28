const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const { upload }   = require('../middleware/upload');
const {
  getAll, createItem, updateItem, deleteItem,
  reorderItems, toggleStatus, uploadImage, deleteImage,
} = require('../controllers/service.controller');

// Public
router.get('/', getAll);

// Protected CRUD
router.post('/',              protect, createItem);
router.put('/:id',            protect, updateItem);
router.delete('/:id',         protect, deleteItem);

// Reorder & status
router.patch('/reorder',      protect, reorderItems);
router.patch('/status/:id',   protect, toggleStatus);

// Image
router.post('/:id/image',     protect, upload.single('image'), uploadImage);
router.delete('/:id/image',   protect, deleteImage);

module.exports = router;
