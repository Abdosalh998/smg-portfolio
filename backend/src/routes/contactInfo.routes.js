const express = require('express');
const router  = express.Router();
const { getContactInfo, updateContactInfo } = require('../controllers/contactInfo.controller');
const { protect } = require('../middleware/auth');

router.get('/', getContactInfo);
router.put('/', protect, updateContactInfo);

module.exports = router;
