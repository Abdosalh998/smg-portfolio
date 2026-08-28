const InboxMessage = require('../models/InboxMessage');

/**
 * Submit contact form (public)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { fullName, companyName, phone, email, subject, message } = req.body;

    // Basic validation
    if (!fullName || !phone || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';

    const userAgent = req.headers['user-agent'] || '';

    const newMessage = await InboxMessage.create({
      fullName,
      companyName: companyName || '',
      phone,
      email,
      subject,
      message,
      ipAddress,
      userAgent,
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all inbox messages (admin only)
 */
exports.getInbox = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.isRead === 'true')  filter.isRead = true;
    if (req.query.isRead === 'false') filter.isRead = false;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ fullName: re }, { subject: re }, { email: re }, { companyName: re }];
    }

    const [messages, total] = await Promise.all([
      InboxMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InboxMessage.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get single inbox message (admin only)
 */
exports.getMessage = async (req, res) => {
  try {
    const msg = await InboxMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    // Auto-mark as read when opened
    if (!msg.isRead) {
      msg.isRead = true;
      await msg.save();
    }

    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Mark as read (admin only)
 */
exports.markRead = async (req, res) => {
  try {
    const msg = await InboxMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Mark as unread (admin only)
 */
exports.markUnread = async (req, res) => {
  try {
    const msg = await InboxMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: false },
      { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Delete message (admin only)
 */
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await InboxMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Bulk operations (admin only)
 */
exports.bulkMarkRead = async (req, res) => {
  try {
    const { ids } = req.body;
    await InboxMessage.updateMany({ _id: { $in: ids } }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    await InboxMessage.deleteMany({ _id: { $in: ids } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
