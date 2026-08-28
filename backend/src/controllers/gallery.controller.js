const Gallery = require('../models/Gallery');
const { optimizeAndSaveImage, optimizeAndSaveThumbnail, deleteFile } = require('../utils/fileHelper');
const fs = require('fs');

/**
 * Get all gallery items
 * Public & Admin
 */
exports.getAll = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const filter = isAdmin ? {} : { isActive: true };
    const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Create gallery item(s) from uploaded images
 * Admin Only
 */
exports.createItems = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    const createdItems = [];
    const maxOrderDoc = await Gallery.findOne().sort({ order: -1 }).select('order');
    let currentOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 1;

    for (const file of req.files) {
      const imagePath = await optimizeAndSaveImage(file.buffer, 'gallery', 'gallery');
      const thumbnailPath = await optimizeAndSaveThumbnail(file.buffer, 'gallery', 'gallery');

      const newItem = await Gallery.create({
        image: imagePath,
        thumbnail: thumbnailPath,
        order: currentOrder,
      });

      createdItems.push(newItem);
      currentOrder++;
    }

    res.status(201).json({ success: true, data: createdItems });
  } catch (error) {
    console.error('Error creating gallery items:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Update gallery text fields
 * Admin Only
 */
exports.updateItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Replace the image of a specific gallery item
 * Admin Only
 */
exports.replaceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // Delete old images
    await deleteFile(item.image);
    await deleteFile(item.thumbnail);

    // Save new images
    const imagePath = await optimizeAndSaveImage(req.file.buffer, 'gallery', 'gallery');
    const thumbnailPath = await optimizeAndSaveThumbnail(req.file.buffer, 'gallery', 'gallery');

    item.image = imagePath;
    item.thumbnail = thumbnailPath;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error replacing gallery image:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Delete a gallery item
 * Admin Only
 */
exports.deleteItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    await deleteFile(item.image);
    await deleteFile(item.thumbnail);
    await item.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Toggle active status
 * Admin Only
 */
exports.toggleStatus = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Reorder gallery items
 * Admin Only
 */
exports.reorderItems = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    for (const item of items) {
      await Gallery.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.json({ success: true, message: 'Gallery reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
