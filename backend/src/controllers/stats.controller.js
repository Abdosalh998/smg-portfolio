// Stats controller - provides aggregate counts for the dashboard home.
// Each count will be updated as new modules are added in future prompts.

const getStats = async (req, res) => {
  // Dynamically import models only if they exist (graceful for incremental builds)
  const loadModel = (name, path) => {
    try { return require(path); } catch { return null; }
  };

  const Product      = loadModel('Product',     '../models/Product');
  const Gallery      = loadModel('Gallery',     '../models/Gallery');
  const Service      = loadModel('Service',     '../models/Service');
  const Application  = loadModel('Application', '../models/Application');
  const InboxMessage = loadModel('InboxMessage','../models/InboxMessage');

  const safeCount = async (Model, filter = {}) => {
    if (!Model) return 0;
    try { return await Model.countDocuments(filter); } catch { return 0; }
  };

  const [
    totalProducts,
    totalGallery,
    totalServices,
    totalApplications,
    totalMessages,
    totalUnread,
  ] = await Promise.all([
    safeCount(Product,     { isActive: true }),
    safeCount(Gallery,     { isActive: true }),
    safeCount(Service,     { isActive: true }),
    safeCount(Application, { isActive: true }),
    safeCount(InboxMessage),
    safeCount(InboxMessage, { isRead: false }),
  ]);

  // Fetch recent 5 inbox messages if model exists
  let recentMessages = [];
  if (InboxMessage) {
    try {
      recentMessages = await InboxMessage.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    } catch { /* model not yet available */ }
  }

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      totalGallery,
      totalServices,
      totalApplications,
      totalMessages,
      totalUnread,
    },
    recentMessages,
  });
};

module.exports = { getStats };
