const express = require('express');
const router  = express.Router();
const { getFooter, updateFooter } = require('../controllers/footer.controller');
const { protect } = require('../middleware/auth');

router.get('/', getFooter);
router.put('/', protect, updateFooter);

module.exports = router;
