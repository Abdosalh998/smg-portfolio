const express = require('express');
const router = express.Router();
const { login, logout, getProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

module.exports = router;
