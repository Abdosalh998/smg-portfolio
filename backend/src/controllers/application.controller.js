const Application = require('../models/Application');
const { optimizeAndSaveImage, deleteFile } = require('../utils/fileHelper');

// ─── Default seed data ─────────────────────────────────────────────────────────
const DEFAULT_APPLICATIONS = [
  { nameAr: 'المطاعم والمطابخ',     nameEn: 'Restaurants & Kitchens',   icon: 'ChefHat',      descriptionAr: 'أنظمة تهوية متطورة لإزالة الأبخرة والروائح', descriptionEn: 'Advanced ventilation for smoke and odor extraction', order: 1 },
  { nameAr: 'المصانع',              nameEn: 'Factories',                icon: 'Factory',      descriptionAr: 'تهوية صناعية للتعامل مع درجات الحرارة والانبعاثات', descriptionEn: 'Industrial ventilation for temperatures and emissions', order: 2 },
  { nameAr: 'الورش',                nameEn: 'Workshops',                icon: 'Wrench',       descriptionAr: 'تهوية للتخلص من الغبار والمواد الكيميائية', descriptionEn: 'Ventilation to eliminate dust and chemicals', order: 3 },
  { nameAr: 'المخازن',              nameEn: 'Warehouses',               icon: 'Warehouse',    descriptionAr: 'تهوية للحفاظ على درجة حرارة وجودة تخزين مثالية', descriptionEn: 'Ventilation to maintain optimal temperature and storage quality', order: 4 },
  { nameAr: 'المولات',              nameEn: 'Malls',                    icon: 'ShoppingBag',  descriptionAr: 'أنظمة تكييف وتهوية للمساحات التجارية الكبيرة', descriptionEn: 'HVAC systems for large commercial spaces', order: 5 },
  { nameAr: 'المستشفيات',           nameEn: 'Hospitals',                icon: 'Hospital',     descriptionAr: 'تهوية معقمة ومدروسة للمستشفيات والمراكز الطبية', descriptionEn: 'Sterile and controlled ventilation for medical centers', order: 6 },
  { nameAr: 'المدارس',              nameEn: 'Schools',                  icon: 'GraduationCap',descriptionAr: 'بيئة صحية نقية للطلاب في المنشآت التعليمية', descriptionEn: 'Clean and healthy environment for educational facilities', order: 7 },
  { nameAr: 'الجراجات',             nameEn: 'Garages',                  icon: 'Car',          descriptionAr: 'أنظمة سحب العوادم للسيارات في المواقف المغلقة', descriptionEn: 'Exhaust extraction systems for closed parking lots', order: 8 },
  { nameAr: 'المباني الإدارية',      nameEn: 'Office Buildings',         icon: 'Building2',    descriptionAr: 'تهوية مكتبية لضمان راحة وإنتاجية الموظفين', descriptionEn: 'Office ventilation to ensure employee comfort and productivity', order: 9 },
  { nameAr: 'المطابخ المركزية',      nameEn: 'Central Kitchens',         icon: 'Utensils',     descriptionAr: 'تغطية واسعة لمتطلبات التهوية في المطابخ الكبرى', descriptionEn: 'Wide coverage for heavy-duty central kitchen requirements', order: 10 },
];

// @desc  Get all applications (public: active only; admin: all)
// @route GET /api/applications
const getAll = async (req, res) => {
  const isAdmin = req.query.admin === 'true';
  const filter  = isAdmin ? {} : { isActive: true };

  let items = await Application.find(filter).sort({ order: 1, createdAt: 1 });

  // Auto-seed on first public visit
  if (items.length === 0 && !isAdmin) {
    await Application.insertMany(DEFAULT_APPLICATIONS);
    items = await Application.find({ isActive: true }).sort({ order: 1 });
  }

  res.status(200).json({ success: true, data: items });
};

// @desc  Create application
// @route POST /api/applications
const createItem = async (req, res) => {
  const { nameAr, nameEn, descriptionAr, descriptionEn, icon, order, isActive } = req.body;

  if (!nameAr || !nameEn) {
    return res.status(400).json({ success: false, message: 'Both Arabic and English names are required' });
  }

  const maxOrder = await Application.findOne().sort({ order: -1 }).select('order');
  const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 1);

  const item = await Application.create({
    nameAr, nameEn,
    descriptionAr: descriptionAr || '',
    descriptionEn: descriptionEn || '',
    icon: icon || 'Building',
    order: nextOrder,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({ success: true, data: item });
};

// @desc  Update application
// @route PUT /api/applications/:id
const updateItem = async (req, res) => {
  const item = await Application.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });

  const { nameAr, nameEn, descriptionAr, descriptionEn, icon, order, isActive } = req.body;

  item.nameAr        = nameAr        ?? item.nameAr;
  item.nameEn        = nameEn        ?? item.nameEn;
  item.descriptionAr = descriptionAr ?? item.descriptionAr;
  item.descriptionEn = descriptionEn ?? item.descriptionEn;
  item.icon          = icon          ?? item.icon;
  item.order         = order         ?? item.order;
  item.isActive      = isActive      ?? item.isActive;

  await item.save();
  res.status(200).json({ success: true, data: item });
};

// @desc  Delete application
// @route DELETE /api/applications/:id
const deleteItem = async (req, res) => {
  const item = await Application.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });

  if (item.image) await deleteFile(item.image);
  await item.deleteOne();

  res.status(200).json({ success: true, message: 'Application deleted' });
};

// @desc  Bulk reorder
// @route PATCH /api/applications/reorder
const reorderItems = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'items array is required' });
  }

  const bulkOps = items.map(({ id, order }) => ({
    updateOne: { filter: { _id: id }, update: { order } },
  }));

  await Application.bulkWrite(bulkOps);
  res.status(200).json({ success: true, message: 'Order updated' });
};

// @desc  Toggle active status
// @route PATCH /api/applications/status/:id
const toggleStatus = async (req, res) => {
  const item = await Application.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });

  item.isActive = !item.isActive;
  await item.save();
  res.status(200).json({ success: true, data: item });
};

// @desc  Upload application image
// @route POST /api/applications/:id/image
const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });

  const item = await Application.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });

  if (item.image) await deleteFile(item.image);

  const imagePath = await optimizeAndSaveImage(req.file.buffer, 'applications', `app-${item._id}`);
  item.image = imagePath;
  await item.save();

  res.status(200).json({ success: true, imagePath, data: item });
};

// @desc  Delete application image
// @route DELETE /api/applications/:id/image
const deleteImage = async (req, res) => {
  const item = await Application.findById(req.params.id);
  if (!item || !item.image) return res.status(404).json({ success: false, message: 'No image found' });

  await deleteFile(item.image);
  item.image = null;
  await item.save();

  res.status(200).json({ success: true, message: 'Image deleted', data: item });
};

module.exports = { getAll, createItem, updateItem, deleteItem, reorderItems, toggleStatus, uploadImage, deleteImage };
