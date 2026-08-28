const Footer = require('../models/Footer');

/**
 * Get footer settings (public & admin)
 */
exports.getFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      // Create default
      footer = await Footer.create({
        quickLinks: [
          { labelAr: 'الرئيسية',    labelEn: 'Home',          path: '#home',          isActive: true },
          { labelAr: 'من نحن',      labelEn: 'About Us',      path: '#about',         isActive: true },
          { labelAr: 'لماذا تختارنا', labelEn: 'Why Choose Us', path: '#why-choose-us', isActive: true },
          { labelAr: 'الخدمات',     labelEn: 'Services',      path: '#services',      isActive: true },
          { labelAr: 'التطبيقات',   labelEn: 'Applications',  path: '#applications',  isActive: true },
          { labelAr: 'المنتجات',    labelEn: 'Products',      path: '#products',      isActive: true },
          { labelAr: 'أعمالنا',     labelEn: 'Projects',      path: '#gallery',       isActive: true },
          { labelAr: 'اتصل بنا',    labelEn: 'Contact Us',    path: '#contact',       isActive: true },
        ],
      });
    } else {
      // Patch any legacy wrong path for Why Choose Us
      let dirty = false;
      footer.quickLinks = footer.quickLinks.map(link => {
        if (link.path === '#why-us') {
          dirty = true;
          return { ...link.toObject(), path: '#why-choose-us' };
        }
        return link;
      });
      if (dirty) await footer.save();
    }
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Update footer settings (admin only)
 */
exports.updateFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = await Footer.create(req.body);
    } else {
      Object.assign(footer, req.body);
      await footer.save();
    }
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
