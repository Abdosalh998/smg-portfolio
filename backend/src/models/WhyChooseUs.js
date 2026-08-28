const mongoose = require('mongoose');

const WhyChooseUsSchema = new mongoose.Schema(
  {
    titleAr: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    titleEn: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    descriptionAr: { type: String, default: '', trim: true },
    descriptionEn: { type: String, default: '', trim: true },
    icon: {
      type: String,
      required: [true, 'Icon is required'],
      default: 'Star',
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for fast sorted queries
WhyChooseUsSchema.index({ order: 1 });

module.exports = mongoose.model('WhyChooseUs', WhyChooseUsSchema);
