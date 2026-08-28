const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: [true, 'Arabic service name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    nameEn: {
      type: String,
      required: [true, 'English service name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    descriptionAr: { type: String, default: '', trim: true },
    descriptionEn: { type: String, default: '', trim: true },
    icon:    { type: String, default: 'Wrench' },
    image:   { type: String, default: null },   // uploaded image path (optional)
    order:   { type: Number, default: 0 },
    isActive:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
