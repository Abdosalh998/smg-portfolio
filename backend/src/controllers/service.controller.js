const Service = require('../models/Service');
const { optimizeAndSaveImage, deleteFile } = require('../utils/fileHelper');

// ─── Default seed data ─────────────────────────────────────────────────────────
const DEFAULT_SERVICES = [
  { nameAr: 'تصميم أنظمة التهوية',     nameEn: 'Ventilation System Design',    icon: 'Cpu',          descriptionAr: 'تصميم أنظمة تهوية مركزية متكاملة تناسب احتياجات مشروعك', descriptionEn: 'Integrated central ventilation system design tailored to your project needs', order: 1 },
  { nameAr: 'حسابات Air Changes',        nameEn: 'Air Changes Calculations',     icon: 'BarChart2',    descriptionAr: 'حسابات دقيقة لمعدلات تغيير الهواء وفق المعايير الهندسية', descriptionEn: 'Precise air change rate calculations according to engineering standards', order: 2 },
  { nameAr: 'اختيار البلاور المناسب',   nameEn: 'Blower Selection',             icon: 'Wind',         descriptionAr: 'اختيار البلاور الأنسب بناءً على الحجم والضغط والاستهلاك', descriptionEn: 'Selecting the optimal blower based on volume, pressure, and energy consumption', order: 3 },
  { nameAr: 'التصنيع حسب الطلب',        nameEn: 'Custom Manufacturing',         icon: 'Hammer',       descriptionAr: 'تصنيع منظومات تهوية حسب المواصفات الخاصة بكل مشروع', descriptionEn: 'Manufacturing ventilation systems to custom specifications for each project', order: 4 },
  { nameAr: 'التوريد',                  nameEn: 'Supply & Procurement',         icon: 'Truck',        descriptionAr: 'توريد معدات ومكونات التهوية بأعلى جودة وأسرع وقت', descriptionEn: 'Supplying ventilation equipment and components with top quality and speed', order: 5 },
  { nameAr: 'التركيب',                  nameEn: 'Installation',                 icon: 'Construction', descriptionAr: 'تركيب احترافي لأنظمة التهوية بفريق فني متخصص', descriptionEn: 'Professional installation of ventilation systems by a specialized technical team', order: 6 },
  { nameAr: 'التشغيل والاختبار',        nameEn: 'Commissioning & Testing',      icon: 'Settings2',    descriptionAr: 'اختبار وتشغيل المنظومة والتحقق من مطابقتها للمواصفات', descriptionEn: 'System testing, commissioning, and verification against specifications', order: 7 },
  { nameAr: 'الصيانة',                  nameEn: 'Maintenance',                  icon: 'Wrench',       descriptionAr: 'خدمات صيانة دورية وإصلاح لضمان الأداء الأمثل', descriptionEn: 'Periodic maintenance and repair services to ensure optimal performance', order: 8 },
  { nameAr: 'معاينة الموقع',            nameEn: 'Site Inspection',              icon: 'MapPin',       descriptionAr: 'معاينة ميدانية شاملة للموقع لتحديد المتطلبات الدقيقة', descriptionEn: 'Comprehensive field site inspection to identify precise requirements', order: 9 },
  { nameAr: 'استخراج عروض الأسعار',     nameEn: 'Quotation & Estimation',       icon: 'FileText',     descriptionAr: 'إعداد عروض أسعار مفصّلة وشفافة بأسرع وقت ممكن', descriptionEn: 'Preparing detailed and transparent quotations as quickly as possible', order: 10 },
];

// @desc  Get all services (public: active only; admin: all)
// @route GET /api/services
const getAll = async (req, res) => {
  const isAdmin = req.query.admin === 'true';
  const filter  = isAdmin ? {} : { isActive: true };

  let items = await Service.find(filter).sort({ order: 1, createdAt: 1 });

  // Auto-seed on first public visit
  if (items.length === 0 && !isAdmin) {
    await Service.insertMany(DEFAULT_SERVICES);
    items = await Service.find({ isActive: true }).sort({ order: 1 });
  }

  res.status(200).json({ success: true, data: items });
};

// @desc  Create service
// @route POST /api/services
const createItem = async (req, res) => {
  const { nameAr, nameEn, descriptionAr, descriptionEn, icon, order, isActive } = req.body;

  if (!nameAr || !nameEn) {
    return res.status(400).json({ success: false, message: 'Both Arabic and English names are required' });
  }

  const maxOrder = await Service.findOne().sort({ order: -1 }).select('order');
  const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 1);

  const item = await Service.create({
    nameAr, nameEn,
    descriptionAr: descriptionAr || '',
    descriptionEn: descriptionEn || '',
    icon: icon || 'Wrench',
    order: nextOrder,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({ success: true, data: item });
};

// @desc  Update service
// @route PUT /api/services/:id
const updateItem = async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Service not found' });

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

// @desc  Delete service
// @route DELETE /api/services/:id
const deleteItem = async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Service not found' });

  if (item.image) await deleteFile(item.image);
  await item.deleteOne();

  res.status(200).json({ success: true, message: 'Service deleted' });
};

// @desc  Bulk reorder
// @route PATCH /api/services/reorder
const reorderItems = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'items array is required' });
  }

  const bulkOps = items.map(({ id, order }) => ({
    updateOne: { filter: { _id: id }, update: { order } },
  }));

  await Service.bulkWrite(bulkOps);
  res.status(200).json({ success: true, message: 'Order updated' });
};

// @desc  Toggle active status
// @route PATCH /api/services/status/:id
const toggleStatus = async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Service not found' });

  item.isActive = !item.isActive;
  await item.save();
  res.status(200).json({ success: true, data: item });
};

// @desc  Upload service image
// @route POST /api/services/:id/image
const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });

  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Service not found' });

  if (item.image) await deleteFile(item.image);

  const imagePath = await optimizeAndSaveImage(req.file.buffer, 'services', `service-${item._id}`);
  item.image = imagePath;
  await item.save();

  res.status(200).json({ success: true, imagePath, data: item });
};

// @desc  Delete service image
// @route DELETE /api/services/:id/image
const deleteImage = async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item || !item.image) return res.status(404).json({ success: false, message: 'No image found' });

  await deleteFile(item.image);
  item.image = null;
  await item.save();

  res.status(200).json({ success: true, message: 'Image deleted', data: item });
};

module.exports = { getAll, createItem, updateItem, deleteItem, reorderItems, toggleStatus, uploadImage, deleteImage };
