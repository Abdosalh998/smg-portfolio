const Product = require('../models/Product');
const { optimizeAndSaveImage, saveDocument, deleteFile } = require('../utils/fileHelper');

// ─── Default seed data ─────────────────────────────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    nameAr: 'مراوح طرد مركزي (Centrifugal)', nameEn: 'Centrifugal Fans',
    categoryAr: 'مراوح صناعية', categoryEn: 'Industrial Fans',
    shortDescriptionAr: 'مراوح عالية الأداء مصممة لتطبيقات السحب والدفع العالي',
    shortDescriptionEn: 'High-performance fans designed for high static pressure applications',
    fullDescriptionAr: 'مراوح الطرد المركزي من SMG مصممة للعمل في أصعب الظروف الصناعية، مع شفرات منحنية لتوفير أعلى كفاءة وأقل استهلاك للطاقة.',
    fullDescriptionEn: 'SMG Centrifugal Fans are designed to operate in the toughest industrial conditions, featuring curved blades for maximum efficiency and minimal energy consumption.',
    specifications: [
      { keyAr: 'المادة', keyEn: 'Material', valAr: 'صلب مجلفن', valEn: 'Galvanized Steel' },
      { keyAr: 'القدرة', keyEn: 'Power', valAr: 'متغير (1 إلى 50 حصان)', valEn: 'Variable (1 to 50 HP)' },
    ],
    featuresAr: ['كفاءة تشغيل عالية', 'مستوى ضوضاء منخفض', 'هيكل متين'],
    featuresEn: ['High operational efficiency', 'Low noise level', 'Durable structure'],
    order: 1
  },
  {
    nameAr: 'مراوح محورية (Axial)', nameEn: 'Axial Fans',
    categoryAr: 'مراوح صناعية', categoryEn: 'Industrial Fans',
    shortDescriptionAr: 'مراوح لتدفق الهواء بكميات كبيرة وضغط منخفض',
    shortDescriptionEn: 'Fans for large air volumes at low pressure',
    fullDescriptionAr: 'تستخدم بشكل مثالي في تهوية المستودعات والمصانع والجراجات، وتوفر تدفق هواء عالي جداً في المساحات المفتوحة.',
    fullDescriptionEn: 'Ideally used for ventilating warehouses, factories, and garages, providing very high airflow in open spaces.',
    specifications: [
      { keyAr: 'المادة', keyEn: 'Material', valAr: 'ألومنيوم', valEn: 'Aluminum' },
      { keyAr: 'القطر', keyEn: 'Diameter', valAr: '300مم - 1200مم', valEn: '300mm - 1200mm' },
    ],
    featuresAr: ['تدفق هواء ضخم', 'سهولة التركيب', 'مقاومة للصدأ'],
    featuresEn: ['Massive airflow', 'Easy installation', 'Rust-resistant'],
    order: 2
  },
  {
    nameAr: 'بلاورات (Blowers)', nameEn: 'Industrial Blowers',
    categoryAr: 'معدات تهوية', categoryEn: 'Ventilation Equipment',
    shortDescriptionAr: 'بلاورات قوية للمطاعم والمطابخ التجارية',
    shortDescriptionEn: 'Powerful blowers for restaurants and commercial kitchens',
    fullDescriptionAr: 'تم تصميم بلاورات SMG لشفط الأبخرة والدهون بكفاءة عالية للحفاظ على بيئة عمل نظيفة وآمنة في المطابخ.',
    fullDescriptionEn: 'SMG Blowers are designed to efficiently extract smoke and grease to maintain a clean and safe working environment in kitchens.',
    specifications: [
      { keyAr: 'المحرك', keyEn: 'Motor', valAr: 'نحاس 100%', valEn: '100% Copper' },
      { keyAr: 'الحماية', keyEn: 'Protection', valAr: 'IP55', valEn: 'IP55' },
    ],
    featuresAr: ['عمر افتراضي طويل', 'شفط عالي الكفاءة', 'صيانة منخفضة'],
    featuresEn: ['Long lifespan', 'Highly efficient extraction', 'Low maintenance'],
    order: 3
  }
];

// @desc  Get all products
// @route GET /api/products
const getAll = async (req, res) => {
  const isAdmin = req.query.admin === 'true';
  const filter  = isAdmin ? {} : { isActive: true };

  let items = await Product.find(filter).sort({ order: 1, createdAt: -1 });

  // Auto-seed on first public visit
  if (items.length === 0 && !isAdmin) {
    await Product.insertMany(DEFAULT_PRODUCTS);
    items = await Product.find({ isActive: true }).sort({ order: 1 });
  }

  res.status(200).json({ success: true, data: items });
};

// @desc  Get single product
// @route GET /api/products/:id
const getById = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
  res.status(200).json({ success: true, data: item });
};

// @desc  Create product
// @route POST /api/products
const createItem = async (req, res) => {
  const { nameAr, nameEn, categoryAr, categoryEn, order } = req.body;

  if (!nameAr || !nameEn || !categoryAr || !categoryEn) {
    return res.status(400).json({ success: false, message: 'Names and categories are required in both languages' });
  }

  const maxOrder = await Product.findOne().sort({ order: -1 }).select('order');
  const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 1);

  const item = await Product.create({ ...req.body, order: nextOrder });
  res.status(201).json({ success: true, data: item });
};

// @desc  Update product
// @route PUT /api/products/:id
const updateItem = async (req, res) => {
  const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
  res.status(200).json({ success: true, data: item });
};

// @desc  Delete product
// @route DELETE /api/products/:id
const deleteItem = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

  // Delete all associated files
  if (item.mainImage) await deleteFile(item.mainImage);
  if (item.datasheet) await deleteFile(item.datasheet);
  if (item.galleryImages?.length > 0) {
    for (const img of item.galleryImages) await deleteFile(img);
  }

  await item.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
};

// @desc  Bulk reorder
// @route PATCH /api/products/reorder
const reorderItems = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items array is required' });

  const bulkOps = items.map(({ id, order }) => ({
    updateOne: { filter: { _id: id }, update: { order } },
  }));
  await Product.bulkWrite(bulkOps);
  res.status(200).json({ success: true, message: 'Order updated' });
};

// @desc  Toggle active status
// @route PATCH /api/products/status/:id
const toggleStatus = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

  item.isActive = !item.isActive;
  await item.save();
  res.status(200).json({ success: true, data: item });
};

// ─── File Uploads ─────────────────────────────────────────────────────────────

// @desc  Upload Main Image
// @route POST /api/products/:id/main-image
const uploadMainImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

  if (item.mainImage) await deleteFile(item.mainImage);
  item.mainImage = await optimizeAndSaveImage(req.file.buffer, 'products', `prod-${item._id}-main`);
  await item.save();

  res.status(200).json({ success: true, mainImage: item.mainImage, data: item });
};

// @desc  Upload Gallery Images
// @route POST /api/products/:id/gallery
const uploadGalleryImages = async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'Please upload images' });
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

  const newImages = [];
  for (let i = 0; i < req.files.length; i++) {
    const path = await optimizeAndSaveImage(req.files[i].buffer, 'products', `prod-${item._id}-gal-${Date.now()}-${i}`);
    newImages.push(path);
  }

  item.galleryImages = [...(item.galleryImages || []), ...newImages];
  await item.save();
  res.status(200).json({ success: true, galleryImages: item.galleryImages, data: item });
};

// @desc  Delete Single Gallery Image
// @route DELETE /api/products/:id/gallery
const deleteGalleryImage = async (req, res) => {
  const { imagePath } = req.body;
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

  item.galleryImages = item.galleryImages.filter(img => img !== imagePath);
  await deleteFile(imagePath);
  await item.save();
  res.status(200).json({ success: true, galleryImages: item.galleryImages, data: item });
};

// @desc  Upload PDF Datasheet
// @route POST /api/products/:id/datasheet
const uploadDatasheet = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF' });
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

  if (item.datasheet) await deleteFile(item.datasheet);
  item.datasheet = await saveDocument(req.file.buffer, 'products', req.file.originalname, `prod-${item._id}-datasheet`);
  await item.save();

  res.status(200).json({ success: true, datasheet: item.datasheet, data: item });
};

// @desc  Delete Datasheet
// @route DELETE /api/products/:id/datasheet
const deleteDatasheet = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item || !item.datasheet) return res.status(404).json({ success: false, message: 'No datasheet found' });

  await deleteFile(item.datasheet);
  item.datasheet = null;
  await item.save();
  res.status(200).json({ success: true, message: 'Datasheet deleted', data: item });
};

module.exports = {
  getAll, getById, createItem, updateItem, deleteItem, reorderItems, toggleStatus,
  uploadMainImage, uploadGalleryImages, deleteGalleryImage, uploadDatasheet, deleteDatasheet
};
