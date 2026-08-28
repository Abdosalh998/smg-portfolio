import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { getIconComp } from '../../constants/whyChooseUsIcons';
import service from '../../services/whyChooseUs.service';
import './WhyChooseUsSection.css';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.07 } }),
};

const SkeletonCard = () => (
  <div className="wcu-card skeleton" style={{ minHeight: 160 }} />
);

const WhyChooseUsSection = ({ lang }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const t = (ar, en) => lang === 'ar' ? ar : en;

  const { data, isLoading } = useQuery({
    queryKey: ['why-choose-us'],
    queryFn:  service.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="public-section wcu-section" id="why-choose-us" ref={ref}>
      {/* ── Section Head ── */}
      <motion.div
        className="wcu-head"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="about-tag">
          <span className="about-tag-dot" />
          {t('لماذا تختارنا', 'Why Choose Us')}
        </span>
        <h2 className="wcu-title">{t('مزايانا التنافسية', 'Our Competitive Advantages')}</h2>
        <p className="wcu-subtitle">
          {t(
            'نقدّم حلول تهوية مركزية متكاملة بجودة عالية وأسعار تنافسية',
            'We provide integrated central ventilation solutions with high quality and competitive prices'
          )}
        </p>
      </motion.div>

      {/* ── Cards Grid ── */}
      <div className="wcu-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => {
              const IconComp = getIconComp(item.icon);
              const title    = lang === 'ar' ? item.titleAr       : item.titleEn;
              const desc     = lang === 'ar' ? item.descriptionAr : item.descriptionEn;

              return (
                <motion.div
                  key={item._id}
                  className="wcu-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'show' : 'hidden'}
                  custom={i}
                >
                  <div className="wcu-card-icon-wrap">
                    <IconComp size={28} />
                  </div>
                  <h3 className="wcu-card-title">{title}</h3>
                  {desc && <p className="wcu-card-desc">{desc}</p>}

                  {/* Decorative corner */}
                  <div className="wcu-card-corner" />
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
