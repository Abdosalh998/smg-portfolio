const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    nameAr: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    categoryAr: { type: String, required: true, trim: true },
    categoryEn: { type: String, required: true, trim: true },
    shortDescriptionAr: { type: String, default: '', trim: true },
    shortDescriptionEn: { type: String, default: '', trim: true },
    fullDescriptionAr: { type: String, default: '', trim: true },
    fullDescriptionEn: { type: String, default: '', trim: true },
    specifications: [
      {
        keyAr: { type: String, trim: true },
        keyEn: { type: String, trim: true },
        valAr: { type: String, trim: true },
        valEn: { type: String, trim: true },
      }
    ],
    featuresAr: [{ type: String, trim: true }],
    featuresEn: [{ type: String, trim: true }],
    mainImage: { type: String, default: null },
    galleryImages: [{ type: String }],
    datasheet: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ order: 1 });
ProductSchema.index({ categoryEn: 1 });

module.exports = mongoose.model('Product', ProductSchema);
