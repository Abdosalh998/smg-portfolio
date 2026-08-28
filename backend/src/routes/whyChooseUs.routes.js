const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAll, createItem, updateItem, deleteItem, reorderItems, toggleStatus,
} = require('../controllers/whyChooseUs.controller');

// Public
router.get('/', getAll);

// Protected
router.post('/',                protect, createItem);
router.put('/:id',              protect, updateItem);
router.delete('/:id',           protect, deleteItem);
router.patch('/reorder',        protect, reorderItems);
router.patch('/status/:id',     protect, toggleStatus);

module.exports = router;
