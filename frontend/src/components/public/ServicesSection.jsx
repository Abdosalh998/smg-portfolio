import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getIconComp } from '../../constants/whyChooseUsIcons';
import serviceService from '../../services/service.service';
import './ServicesSection.css';

import BASE_URL from '../../utils/baseUrl';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.07 },
  }),
};

const SkeletonCard = () => (
  <div className="svc-card skeleton" style={{ minHeight: 200 }} />
);

const ServicesSection = ({ lang }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const { data, isLoading } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => serviceService.getAll(false),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="public-section svc-section" id="services" ref={ref}>
      {/* ── Head ── */}
      <motion.div
        className="svc-head"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="about-tag">
          <span className="about-tag-dot" />
          {t('خدماتنا', 'Our Services')}
        </span>
        <h2 className="svc-title">{t('الخدمات', 'Services')}</h2>
        <p className="svc-subtitle">
          {t(
            'نقدّم باقة متكاملة من الخدمات الهندسية لأنظمة التهوية المركزية',
            'We offer a comprehensive range of engineering services for central ventilation systems'
          )}
        </p>
      </motion.div>

      {/* ── Grid ── */}
      <div className="svc-grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => {
              const IconComp  = getIconComp(item.icon);
              const name      = lang === 'ar' ? item.nameAr      : item.nameEn;
              const desc      = lang === 'ar' ? item.descriptionAr : item.descriptionEn;
              const imgSrc    = item.image ? `${BASE_URL}${item.image}` : null;

              return (
                <motion.div
                  key={item._id}
                  className="svc-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'show' : 'hidden'}
                  custom={i}
                >
                  {/* Icon / Image area */}
                  <div className="svc-card-top">
                    {imgSrc ? (
                      <img src={imgSrc} alt={name} className="svc-card-img" loading="lazy" />
                    ) : (
                      <div className="svc-card-icon-wrap">
                        <IconComp size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="svc-card-body">
                    <h3 className="svc-card-title">{name}</h3>
                    {desc && <p className="svc-card-desc">{desc}</p>}
                  </div>

                  {/* Hover CTA */}
                  <div className="svc-card-cta">
                    <a href="#contact" className="svc-cta-link">
                      {t('تواصل معنا', 'Contact Us')}
                      <ArrowIcon size={14} />
                    </a>
                  </div>

                  {/* Decorative stripe */}
                  <div className="svc-card-stripe" />
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default ServicesSection;
