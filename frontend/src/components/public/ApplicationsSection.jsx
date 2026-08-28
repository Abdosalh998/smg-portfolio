import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { getIconComp } from '../../constants/whyChooseUsIcons';
import applicationService from '../../services/application.service';
import './ApplicationsSection.css';

import BASE_URL from '../../utils/baseUrl';

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.08 },
  }),
};

const SkeletonCard = () => (
  <div className="app-pub-card skeleton" style={{ minHeight: 220 }} />
);

const ApplicationsSection = ({ lang }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const t = (ar, en) => (lang === 'ar' ? ar : en);

  const { data, isLoading } = useQuery({
    queryKey: ['applications-public'],
    queryFn: () => applicationService.getAll(false),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="public-section app-pub-section" id="applications" ref={ref}>
      {/* ── Head ── */}
      <motion.div
        className="app-pub-head"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="about-tag">
          <span className="about-tag-dot" />
          {t('التطبيقات', 'Applications')}
        </span>
        <h2 className="app-pub-title">{t('مجالات العمل', 'Where We Work')}</h2>
        <p className="app-pub-subtitle">
          {t(
            'نقدم حلولاً مبتكرة لأنظمة التهوية المركزية تلبي احتياجات مختلف القطاعات والمشاريع',
            'We provide innovative central ventilation solutions that meet the needs of various sectors and projects'
          )}
        </p>
      </motion.div>

      {/* ── Grid ── */}
      <div className="app-pub-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => {
              const IconComp  = getIconComp(item.icon);
              const name      = lang === 'ar' ? item.nameAr      : item.nameEn;
              const desc      = lang === 'ar' ? item.descriptionAr : item.descriptionEn;
              const imgSrc    = item.image ? `${BASE_URL}${item.image}` : null;

              return (
                <motion.div
                  key={item._id}
                  className="app-pub-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'show' : 'hidden'}
                  custom={i}
                >
                  {/* Background Image / Icon */}
                  {imgSrc ? (
                    <div className="app-pub-card-bg">
                      <img src={imgSrc} alt={name} loading="lazy" />
                      <div className="app-pub-card-overlay" />
                    </div>
                  ) : (
                    <div className="app-pub-card-bg-icon">
                      <IconComp size={80} strokeWidth={1} />
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="app-pub-card-content">
                    <div className="app-pub-icon-small">
                      <IconComp size={24} />
                    </div>
                    <div>
                      <h3 className="app-pub-card-title">{name}</h3>
                      {desc && <p className="app-pub-card-desc">{desc}</p>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default ApplicationsSection;
