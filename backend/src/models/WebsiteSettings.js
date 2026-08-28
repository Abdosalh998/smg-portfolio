const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema(
  {
    websiteNameAr: { type: String, default: 'SMG Turbo Fan' },
    websiteNameEn: { type: String, default: 'SMG Turbo Fan' },
    websiteTitleAr: { type: String, default: 'SMG Turbo Fan - أنظمة تهوية مركزية' },
    websiteTitleEn: { type: String, default: 'SMG Turbo Fan - Central Ventilation Systems' },
    websiteDescriptionAr: { type: String, default: '' },
    websiteDescriptionEn: { type: String, default: '' },
    
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    
    metaTitleAr: { type: String, default: '' },
    metaTitleEn: { type: String, default: '' },
    metaDescriptionAr: { type: String, default: '' },
    metaDescriptionEn: { type: String, default: '' },
    metaKeywordsAr: { type: String, default: '' },
    metaKeywordsEn: { type: String, default: '' },
    
    analytics: {
      googleAnalyticsId: { type: String, default: '' },
      googleTagManagerId: { type: String, default: '' },
      facebookPixelId: { type: String, default: '' },
    },
    
    theme: {
      primaryColor: { type: String, default: '#050505' },
      secondaryColor: { type: String, default: '#64748b' },
      accentColor: { type: String, default: '#e60000' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
