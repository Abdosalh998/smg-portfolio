const About = require('../models/About');
const { optimizeAndSaveImage, deleteFile } = require('../utils/fileHelper');

// @desc    Get About Us data
// @route   GET /api/about
// @access  Public
const getAbout = async (req, res) => {
  let about = await About.findOne();
  
  // If no data exists, return a default empty object instead of 404
  if (!about) {
    about = {
      arabicTitle: '',
      companyName: '',
      englishName: '',
      description: '',
      arabicDescription: '',
      image: null,
    };
  }

  res.status(200).json({ success: true, data: about });
};

// @desc    Update About Us data
// @route   PUT /api/about
// @access  Private (Admin)
const updateAbout = async (req, res) => {
  const { arabicTitle, companyName, englishName, description, arabicDescription } = req.body;

  let about = await About.findOne();

  if (about) {
    about.arabicTitle       = arabicTitle;
    about.companyName       = companyName;
    about.englishName       = englishName;
    about.description       = description;
    about.arabicDescription = arabicDescription || '';
    await about.save();
  } else {
    about = await About.create({
      arabicTitle,
      companyName,
      englishName,
      description,
      arabicDescription: arabicDescription || '',
    });
  }

  res.status(200).json({ success: true, data: about });
};

// @desc    Upload About Us image
// @route   POST /api/about/upload-image
// @access  Private (Admin)
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }

  let about = await About.findOne();
  if (!about) {
    // We should have an about document before uploading an image ideally,
    // but if not, create a skeleton.
    about = await About.create({
      arabicTitle: 'Draft',
      companyName: 'Draft',
      englishName: 'Draft',
      description: 'Draft',
    });
  }

  // If there's an existing image, delete it from disk
  if (about.image) {
    await deleteFile(about.image);
  }

  // Optimize and save new image
  const imagePath = await optimizeAndSaveImage(req.file.buffer, 'about', 'about');
  
  about.image = imagePath;
  await about.save();

  res.status(200).json({ success: true, imagePath, data: about });
};

// @desc    Delete About Us image
// @route   DELETE /api/about/image
// @access  Private (Admin)
const deleteImage = async (req, res) => {
  const about = await About.findOne();

  if (!about || !about.image) {
    return res.status(404).json({ success: false, message: 'No image found' });
  }

  // Delete from disk
  await deleteFile(about.image);

  // Update DB
  about.image = null;
  await about.save();

  res.status(200).json({ success: true, message: 'Image deleted', data: about });
};

module.exports = {
  getAbout,
  updateAbout,
  uploadImage,
  deleteImage,
};
