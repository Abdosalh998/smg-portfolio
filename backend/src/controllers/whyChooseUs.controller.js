const WhyChooseUs = require('../models/WhyChooseUs');

// ─── Default seed data ────────────────────────────────────────────────────────
const DEFAULT_ITEMS = [
  { titleAr: 'جودة التصنيع',      titleEn: 'Manufacturing Quality',  icon: 'BadgeCheck',   descriptionAr: 'نلتزم بأعلى معايير الجودة في كل منتج', descriptionEn: 'We commit to the highest quality standards in every product', order: 1 },
  { titleAr: 'أسعار منافسة',       titleEn: 'Competitive Prices',     icon: 'BadgeDollarSign', descriptionAr: 'أسعار تنافسية تناسب جميع الميزانيات', descriptionEn: 'Competitive prices to suit all budgets', order: 2 },
  { titleAr: 'سرعة التوريد',       titleEn: 'Fast Delivery',          icon: 'Zap',          descriptionAr: 'توريد سريع ودقيق في المواعيد المحددة', descriptionEn: 'Fast and punctual delivery on schedule', order: 3 },
  { titleAr: 'تصنيع حسب الطلب',    titleEn: 'Custom Manufacturing',   icon: 'Settings2',    descriptionAr: 'نصنّع حسب المواصفات والاحتياجات الخاصة', descriptionEn: 'Manufactured to your specific requirements', order: 4 },
  { titleAr: 'خبرة فنية',          titleEn: 'Technical Expertise',    icon: 'Wrench',       descriptionAr: 'فريق هندسي متخصص بخبرات واسعة', descriptionEn: 'Specialized engineering team with extensive expertise', order: 5 },
  { titleAr: 'ضمان',               titleEn: 'Warranty',               icon: 'ShieldCheck',  descriptionAr: 'ضمان شامل على جميع منتجاتنا وخدماتنا', descriptionEn: 'Comprehensive warranty on all our products and services', order: 6 },
  { titleAr: 'خدمة ما بعد البيع',   titleEn: 'After-Sales Service',   icon: 'Headphones',   descriptionAr: 'دعم فني متواصل بعد البيع والتركيب', descriptionEn: 'Continuous technical support after sale and installation', order: 7 },
  { titleAr: 'تركيب وصيانة',        titleEn: 'Installation & Maintenance', icon: 'Construction', descriptionAr: 'خدمات تركيب وصيانة احترافية متكاملة', descriptionEn: 'Professional integrated installation and maintenance services', order: 8 },
];

// @desc    Get all items (public: active only; admin: all)
// @route   GET /api/why-choose-us
// @access  Public
const getAll = async (req, res) => {
  const isAdmin = req.query.admin === 'true';
  const filter  = isAdmin ? {} : { isActive: true };

  let items = await WhyChooseUs.find(filter).sort({ order: 1, createdAt: 1 });

  // Auto-seed on first visit if DB is empty
  if (items.length === 0 && !isAdmin) {
    await WhyChooseUs.insertMany(DEFAULT_ITEMS);
    items = await WhyChooseUs.find({ isActive: true }).sort({ order: 1 });
  }

  res.status(200).json({ success: true, data: items });
};

// @desc    Create new item
// @route   POST /api/why-choose-us
// @access  Private
const createItem = async (req, res) => {
  const { titleAr, titleEn, descriptionAr, descriptionEn, icon, order, isActive } = req.body;

  // Auto-assign order if not provided
  const maxOrder = await WhyChooseUs.findOne().sort({ order: -1 }).select('order');
  const nextOrder = order !== undefined ? order : (maxOrder ? maxOrder.order + 1 : 1);

  const item = await WhyChooseUs.create({
    titleAr, titleEn,
    descriptionAr: descriptionAr || '',
    descriptionEn: descriptionEn || '',
    icon: icon || 'Star',
    order: nextOrder,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({ success: true, data: item });
};

// @desc    Update item
// @route   PUT /api/why-choose-us/:id
// @access  Private
const updateItem = async (req, res) => {
  const item = await WhyChooseUs.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  const { titleAr, titleEn, descriptionAr, descriptionEn, icon, order, isActive } = req.body;

  item.titleAr       = titleAr       ?? item.titleAr;
  item.titleEn       = titleEn       ?? item.titleEn;
  item.descriptionAr = descriptionAr ?? item.descriptionAr;
  item.descriptionEn = descriptionEn ?? item.descriptionEn;
  item.icon          = icon          ?? item.icon;
  item.order         = order         ?? item.order;
  item.isActive      = isActive      ?? item.isActive;

  await item.save();
  res.status(200).json({ success: true, data: item });
};

// @desc    Delete item
// @route   DELETE /api/why-choose-us/:id
// @access  Private
const deleteItem = async (req, res) => {
  const item = await WhyChooseUs.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.status(200).json({ success: true, message: 'Item deleted' });
};

// @desc    Reorder items (bulk update)
// @route   PATCH /api/why-choose-us/reorder
// @access  Private
const reorderItems = async (req, res) => {
  const { items } = req.body; // [{ id, order }, ...]
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'items array is required' });
  }

  const bulkOps = items.map(({ id, order }) => ({
    updateOne: { filter: { _id: id }, update: { order } },
  }));

  await WhyChooseUs.bulkWrite(bulkOps);
  res.status(200).json({ success: true, message: 'Order updated' });
};

// @desc    Toggle active status
// @route   PATCH /api/why-choose-us/status/:id
// @access  Private
const toggleStatus = async (req, res) => {
  const item = await WhyChooseUs.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  item.isActive = !item.isActive;
  await item.save();
  res.status(200).json({ success: true, data: item });
};

module.exports = { getAll, createItem, updateItem, deleteItem, reorderItems, toggleStatus };
