const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage, getInbox, getMessage,
  markRead, markUnread, deleteMessage,
  bulkMarkRead, bulkDelete,
} = require('../controllers/inbox.controller');

// Public — submit contact form
router.post('/send', sendMessage);

// Admin — inbox management
router.use(protect);
router.get('/',              getInbox);
router.get('/:id',           getMessage);
router.patch('/read/:id',    markRead);
router.patch('/unread/:id',  markUnread);
router.delete('/:id',        deleteMessage);
router.post('/bulk-read',    bulkMarkRead);
router.post('/bulk-delete',  bulkDelete);

module.exports = router;
