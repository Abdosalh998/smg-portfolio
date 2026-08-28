const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema(
  {
    companyDescriptionAr: { type: String, default: '' },
    companyDescriptionEn: { type: String, default: '' },
    copyrightAr: { type: String, default: '© 2026 S.M.G Turbo Fan Central Ventilation Systems.' },
    copyrightEn: { type: String, default: '© 2026 S.M.G Turbo Fan Central Ventilation Systems.' },
    quickLinks: [
      {
        labelAr: { type: String, required: true },
        labelEn: { type: String, required: true },
        path: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Footer', footerSchema);
