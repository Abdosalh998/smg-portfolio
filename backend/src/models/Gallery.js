const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    titleAr: {
      type: String,
      trim: true,
      default: '',
    },
    titleEn: {
      type: String,
      trim: true,
      default: '',
    },
    locationAr: {
      type: String,
      trim: true,
      default: '',
    },
    locationEn: {
      type: String,
      trim: true,
      default: '',
    },
    descriptionAr: {
      type: String,
      trim: true,
      default: '',
    },
    descriptionEn: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
