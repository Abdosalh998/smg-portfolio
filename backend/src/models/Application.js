const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: [true, 'Arabic application name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    nameEn: {
      type: String,
      required: [true, 'English application name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    descriptionAr: { type: String, default: '', trim: true },
    descriptionEn: { type: String, default: '', trim: true },
    icon:    { type: String, default: 'Building' },
    image:   { type: String, default: null },
    order:   { type: Number, default: 0 },
    isActive:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

ApplicationSchema.index({ order: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
