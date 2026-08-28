const express = require('express');
const router  = express.Router();
const { getSettings, updateSettings, uploadMedia } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getSettings);
router.put('/', protect, updateSettings);
router.post('/upload', protect, upload.single('image'), uploadMedia);

module.exports = router;
