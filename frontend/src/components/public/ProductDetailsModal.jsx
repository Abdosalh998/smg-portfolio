import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, FileText, CheckCircle, Package } from 'lucide-react';
import './ProductDetailsModal.css';

import BASE_URL from '../../utils/baseUrl';

const ProductDetailsModal = ({ product, lang, onClose }) => {
  if (!product) return null;

  const t = (ar, en) => lang === 'ar' ? ar : en;
  
  const name = lang === 'ar' ? product.nameAr : product.nameEn;
  const cat = lang === 'ar' ? product.categoryAr : product.categoryEn;
  const fullDesc = lang === 'ar' ? product.fullDescriptionAr : product.fullDescriptionEn;
  const specs = product.specifications || [];
  const features = (lang === 'ar' ? product.featuresAr : product.featuresEn) || [];
  
  const mainImg = product.mainImage ? `${BASE_URL}${product.mainImage}` : null;
  const galleries = (product.galleryImages || []).map(img => `${BASE_URL}${img}`);
  const allImages = mainImg ? [mainImg, ...galleries] : galleries;

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const handleNext = () => setActiveImgIdx((prev) => (prev + 1) % allImages.length);
  const handlePrev = () => setActiveImgIdx((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <AnimatePresence>
      <div className="prod-modal-overlay" onClick={onClose}>
        <motion.div 
          className="prod-details-modal"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="prod-close-btn" onClick={onClose}><X size={24} /></button>

          <div className="prod-modal-layout">
            
            {/* Left/Top: Image Gallery */}
            <div className="prod-gallery-side">
              {allImages.length > 0 ? (
                <>
                  <div className="prod-main-img-wrap">
                    <img src={allImages[activeImgIdx]} alt={name} className="prod-main-img" />
                    {allImages.length > 1 && (
                      <div className="prod-img-nav">
                        <button onClick={handlePrev} className="nav-btn"><ChevronLeft size={20}/></button>
                        <button onClick={handleNext} className="nav-btn"><ChevronRight size={20}/></button>
                      </div>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="prod-thumbs">
                      {allImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={`prod-thumb ${idx === activeImgIdx ? 'active' : ''}`}
                          onClick={() => setActiveImgIdx(idx)}
                        >
                          <img src={img} alt={`Thumb ${idx}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="prod-main-img-wrap empty">
                  <Package size={64} opacity={0.2} />
                </div>
              )}
            </div>

            {/* Right/Bottom: Content */}
            <div className="prod-info-side" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <span className="prod-cat-badge">{cat}</span>
              <h2 className="prod-modal-title">{name}</h2>
              
              {fullDesc && (
                <div className="prod-desc-block">
                  <p>{fullDesc}</p>
                </div>
              )}

              {features.length > 0 && (
                <div className="prod-features-block">
                  <h3 className="block-title">{t('المميزات', 'Features')}</h3>
                  <ul className="prod-features-list">
                    {features.map((f, i) => (
                      <li key={i}><CheckCircle size={16} className="text-accent" /> {f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {specs.length > 0 && (
                <div className="prod-specs-block">
                  <h3 className="block-title">{t('المواصفات الفنية', 'Technical Specifications')}</h3>
                  <div className="prod-specs-table">
                    {specs.map((s, i) => (
                      <div key={i} className="spec-row">
                        <span className="spec-key">{lang === 'ar' ? s.keyAr : s.keyEn}</span>
                        <span className="spec-val">{lang === 'ar' ? s.valAr : s.valEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.datasheet && (
                <div className="prod-datasheet-block">
                  <a href={`${BASE_URL}${product.datasheet}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary datasheet-btn">
                    <FileText size={18} />
                    {t('تحميل المواصفات الفنية (PDF)', 'Download Datasheet (PDF)')}
                  </a>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
