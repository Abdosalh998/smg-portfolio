const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema(
  {
    arabicTitle: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    englishName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    arabicDescription: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('About', AboutSchema);
