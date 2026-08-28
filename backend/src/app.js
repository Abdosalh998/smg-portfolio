require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes         = require('./routes/auth.routes');
const statsRoutes        = require('./routes/stats.routes');
const aboutRoutes        = require('./routes/about.routes');
const whyChooseUsRoutes  = require('./routes/whyChooseUs.routes');
const serviceRoutes      = require('./routes/service.routes');
const applicationRoutes  = require('./routes/application.routes');
const productRoutes      = require('./routes/product.routes');
const galleryRoutes      = require('./routes/gallery.routes');
const contactInfoRoutes  = require('./routes/contactInfo.routes');
const inboxRoutes        = require('./routes/inbox.routes');
const footerRoutes       = require('./routes/footer.routes');
const settingsRoutes     = require('./routes/settings.routes');

const app = express();

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from uploads
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use(generalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Files (Uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',           authLimiter, authRoutes);
app.use('/api/stats',          statsRoutes);
app.use('/api/about',          aboutRoutes);
app.use('/api/why-choose-us',  whyChooseUsRoutes);
app.use('/api/services',       serviceRoutes);
app.use('/api/applications',   applicationRoutes);
app.use('/api/products',       productRoutes);
app.use('/api/gallery',             galleryRoutes);
app.use('/api/contact-information', contactInfoRoutes);
app.use('/api/inbox',               inboxRoutes);
app.use('/api/footer',              footerRoutes);
app.use('/api/website-settings',    settingsRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SMG Turbo Fan API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
