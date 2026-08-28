const ContactInfo = require('../models/ContactInfo');

/**
 * Get contact information (public & admin)
 */
exports.getContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      // Auto-create default document on first call
      info = await ContactInfo.create({});
    }
    res.json({ success: true, data: info });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Update contact information (admin only)
 */
exports.updateContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      info = await ContactInfo.create(req.body);
    } else {
      // Deep merge socialLinks
      if (req.body.socialLinks) {
        req.body.socialLinks = { ...info.socialLinks.toObject(), ...req.body.socialLinks };
      }
      Object.assign(info, req.body);
      await info.save();
    }
    res.json({ success: true, data: info });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
