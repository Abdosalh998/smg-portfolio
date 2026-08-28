const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema(
  {
    companyNameAr: { type: String, default: 'SMG Turbo Fan' },
    companyNameEn: { type: String, default: 'SMG Turbo Fan' },
    addressAr:     { type: String, default: '' },
    addressEn:     { type: String, default: '' },
    phone:         { type: [String], default: [] },
    whatsapp:      { type: String, default: '' },
    email:         { type: String, default: '' },
    workingHoursAr:{ type: String, default: '' },
    workingHoursEn:{ type: String, default: '' },
    googleMapsUrl: { type: String, default: '' },
    socialLinks: {
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin:  { type: String, default: '' },
      twitter:   { type: String, default: '' },
      youtube:   { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
