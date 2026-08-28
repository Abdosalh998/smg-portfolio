import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Package, ArrowLeft, ArrowRight } from 'lucide-react';
import productService from '../../services/product.service';
import ProductDetailsModal from './ProductDetailsModal';
import './ProductsSection.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const SkeletonCard = () => (
  <div className="prod-pub-card skeleton" style={{ height: 380 }} />
);

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.09 },
  }),
};

const ProductsSection = ({ lang }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const t = (ar, en) => lang === 'ar' ? ar : en;

  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products-public'],
    queryFn: () => productService.getAll(false),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="public-section prod-pub-section" id="products" ref={ref}>
      {/* Head */}
      <motion.div
        className="prod-pub-head"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="about-tag">
          <span className="about-tag-dot" />
          {t('المنتجات', 'Products')}
        </span>
        <h2 className="prod-pub-title">{t('منتجاتنا', 'Our Products')}</h2>
        <p className="prod-pub-subtitle">
          {t(
            'نوفر أنظمة تهوية مركزية متكاملة بجودة عالية وأسعار تنافسية تناسب جميع المشاريع',
            'We provide integrated central ventilation systems with high quality and competitive prices for all projects'
          )}
        </p>
      </motion.div>

      {/* Grid */}
      <div className="prod-pub-grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => {
              const name = lang === 'ar' ? item.nameAr : item.nameEn;
              const cat = lang === 'ar' ? item.categoryAr : item.categoryEn;
              const shortDesc = lang === 'ar' ? item.shortDescriptionAr : item.shortDescriptionEn;
              const imgSrc = item.mainImage ? `${BASE_URL}${item.mainImage}` : null;

              return (
                <motion.div
                  key={item._id}
                  className="prod-pub-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'show' : 'hidden'}
                  custom={i}
                >
                  {/* Image */}
                  <div className="prod-pub-card-img-wrap">
                    {imgSrc ? (
                      <img src={imgSrc} alt={name} loading="lazy" />
                    ) : (
                      <div className="prod-pub-card-placeholder">
                        <Package size={52} strokeWidth={1} />
                      </div>
                    )}
                    <span className="prod-pub-cat-badge">{cat}</span>
                  </div>

                  {/* Body */}
                  <div className="prod-pub-card-body" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <h3 className="prod-pub-card-title">{name}</h3>
                    {shortDesc && (
                      <p className="prod-pub-card-desc">{shortDesc}</p>
                    )}
                    <button
                      className="prod-pub-cta"
                      onClick={() => setSelectedProduct(item)}
                    >
                      {t('عرض التفاصيل', 'View Details')}
                      {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          lang={lang}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

export default ProductsSection;
