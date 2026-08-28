const WebsiteSettings = require('../models/WebsiteSettings');

/**
 * Get website settings (public & admin)
 */
exports.getSettings = async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Update website settings (admin only)
 */
exports.updateSettings = async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create(req.body);
    } else {
      // Deep merge nested objects
      if (req.body.analytics) {
        req.body.analytics = { ...settings.analytics.toObject(), ...req.body.analytics };
      }
      if (req.body.theme) {
        req.body.theme = { ...settings.theme.toObject(), ...req.body.theme };
      }
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Upload Logo or Favicon (admin only)
 */
exports.uploadMedia = async (req, res) => {
  try {
    const { field } = req.body; // 'logo' or 'favicon'
    if (!['logo', 'favicon'].includes(field)) {
      return res.status(400).json({ success: false, message: 'Invalid field' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    
    let settings = await WebsiteSettings.findOne();
    if (!settings) settings = await WebsiteSettings.create({});
    
    settings[field] = filePath;
    await settings.save();

    res.json({ success: true, url: filePath, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
