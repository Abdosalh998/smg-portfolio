const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/stats.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getStats);

module.exports = router;
