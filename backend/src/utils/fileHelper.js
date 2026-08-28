const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Optimizes an uploaded image and saves it to the disk.
 * @param {Buffer} buffer - The image buffer from multer memory storage
 * @param {string} directory - The directory name inside 'uploads' (e.g., 'about')
 * @param {string} filenamePrefix - Prefix for the filename (e.g., 'about')
 * @returns {Promise<string>} - The relative path to the saved image
 */
const optimizeAndSaveImage = async (buffer, directory, filenamePrefix) => {
  const uploadsDir = path.join(__dirname, '../../uploads', directory);
  
  // Ensure directory exists
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  const filename = `${filenamePrefix}-${Date.now()}.webp`;
  const filepath = path.join(uploadsDir, filename);

  // Resize and convert to WebP
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true }) // reasonable max width
    .webp({ quality: 80 }) // 80% quality is a good balance for web
    .toFile(filepath);

  return `/uploads/${directory}/${filename}`;
};

/**
 * Creates a smaller thumbnail version of an uploaded image and saves it to disk.
 * @param {Buffer} buffer - The image buffer from multer
 * @param {string} directory - The directory name inside 'uploads'
 * @param {string} filenamePrefix - Prefix for the filename
 * @returns {Promise<string>} - The relative path to the saved thumbnail
 */
const optimizeAndSaveThumbnail = async (buffer, directory, filenamePrefix) => {
  const uploadsDir = path.join(__dirname, '../../uploads', directory);
  
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  const filename = `${filenamePrefix}-thumb-${Date.now()}.webp`;
  const filepath = path.join(uploadsDir, filename);

  // Resize to a max width of 500px for thumbnails
  await sharp(buffer)
    .resize({ width: 500, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath);

  return `/uploads/${directory}/${filename}`;
};

/**
 * Saves a document file directly to the disk without processing.
 * @param {Buffer} buffer - The file buffer
 * @param {string} directory - The directory name inside 'uploads'
 * @param {string} originalName - Original filename to extract extension
 * @param {string} filenamePrefix - Prefix for the filename
 * @returns {Promise<string>} - The relative path to the saved document
 */
const saveDocument = async (buffer, directory, originalName, filenamePrefix) => {
  const uploadsDir = path.join(__dirname, '../../uploads', directory);
  
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalName) || '.pdf';
  const filename = `${filenamePrefix}-${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);

  await fs.writeFile(filepath, buffer);

  return `/uploads/${directory}/${filename}`;
};

/**
 * Deletes a file from the disk.
 * @param {string} relativePath - The relative path (e.g., '/uploads/about/image.webp')
 */
const deleteFile = async (relativePath) => {
  if (!relativePath) return;
  
  const absolutePath = path.join(__dirname, '../../', relativePath);
  try {
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
  } catch (err) {
    console.error(`Failed to delete file: ${absolutePath}`, err.message);
  }
};

module.exports = {
  optimizeAndSaveImage,
  optimizeAndSaveThumbnail,
  saveDocument,
  deleteFile,
};
