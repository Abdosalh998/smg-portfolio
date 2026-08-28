import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MapPin, ZoomIn, ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import galleryService from '../../services/gallery.service';
import './GallerySection.css';

import BASE_URL from '../../utils/baseUrl';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.09 },
  }),
};

/* ── Lightbox ──────────────────────────────────────────────────────── */
const Lightbox = ({ items, currentIndex, onClose, onNavigate, lang }) => {
  const item = items[currentIndex];
  if (!item) return null;

  const title = lang === 'ar' ? item.titleAr : item.titleEn;
  const location = lang === 'ar' ? item.locationAr : item.locationEn;
  const description = lang === 'ar' ? item.descriptionAr : item.descriptionEn;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % items.length);
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  return createPortal(
    <motion.div
      className="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="lightbox-close" onClick={onClose}>
        <X size={22} />
      </button>

      {items.length > 1 && (
        <>
          <button
            className="lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + items.length) % items.length); }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % items.length); }}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={`${BASE_URL}${item.image}`}
            alt={title || 'Project'}
            className="lightbox-img"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            draggable={false}
          />
        </AnimatePresence>

        {(title || location || description) && (
          <motion.div
            className="lightbox-info"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            key={`info-${currentIndex}`}
          >
            {title && <h3>{title}</h3>}
            {location && (
              <div className="lightbox-location">
                <MapPin size={14} />
                <span>{location}</span>
              </div>
            )}
            {description && <p className="lightbox-desc">{description}</p>}
          </motion.div>
        )}
      </div>

      {items.length > 1 && (
        <div className="lightbox-counter">
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </motion.div>,
    document.body
  );
};

/* ── Skeleton Card ─────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="gallery-pub-skeleton">
    <div className="skeleton" style={{ height: 220 }} />
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: 20, width: '70%' }} />
      <div className="skeleton" style={{ height: 14, width: '100%' }} />
      <div className="skeleton" style={{ height: 14, width: '85%' }} />
      <div className="skeleton" style={{ height: 42, marginTop: 8 }} />
    </div>
  </div>
);

/* ── GallerySection ────────────────────────────────────────────────── */
const GallerySection = ({ lang }) => {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery-public'],
    queryFn: () => galleryService.getAll(false),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="public-section gallery-pub-section" id="gallery" ref={ref}>
      {/* Head */}
      <motion.div
        className="gallery-pub-head"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="about-tag">
          <span className="about-tag-dot" />
          {t('أعمالنا', 'Our Work')}
        </span>
        <h2 className="gallery-pub-title">{t('صور من الأعمال السابقة', 'Previous Projects Gallery')}</h2>
        <p className="gallery-pub-subtitle">
          {t(
            'نستعرض لكم جانباً من مشاريعنا المنفذة بنجاح في مختلف القطاعات',
            'Showcasing a selection of our successfully completed projects across various sectors'
          )}
        </p>
      </motion.div>

      {/* Grid */}
      <div className="gallery-pub-grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => {
              const title = lang === 'ar' ? item.titleAr : item.titleEn;
              const location = lang === 'ar' ? item.locationAr : item.locationEn;
              const description = lang === 'ar' ? item.descriptionAr : item.descriptionEn;

              return (
                <motion.div
                  key={item._id}
                  className="gallery-pub-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'show' : 'hidden'}
                  custom={i}
                  onClick={() => setLightboxIndex(i)}
                >
                  {/* Image */}
                  <div className="gallery-pub-card-img-wrap">
                    {item.thumbnail ? (
                      <img src={`${BASE_URL}${item.thumbnail}`} alt={title || 'Project'} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f2f5, #e5e8ef)' }}>
                        <ImageIcon size={52} strokeWidth={1} color="#c0c8d8" />
                      </div>
                    )}
                    <div className="gallery-pub-card-zoom">
                      <ZoomIn size={40} strokeWidth={1.5} />
                    </div>
                    {location && (
                      <span className="gallery-pub-location-badge">
                        <MapPin size={11} />
                        {location}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="gallery-pub-card-body" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {title ? (
                      <h3 className="gallery-pub-card-title">{title}</h3>
                    ) : (
                      <h3 className="gallery-pub-card-title" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {t('مشروع', 'Project')}
                      </h3>
                    )}
                    {description && (
                      <p className="gallery-pub-card-desc">{description}</p>
                    )}
                    <button className="gallery-pub-cta">
                      {t('عرض الصورة', 'View Image')}
                      {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </button>
                  </div>
                </motion.div>
              );
            })
        }
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={items}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
