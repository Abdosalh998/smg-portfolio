import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, ArrowRight, Wind } from 'lucide-react';
import DOMPurify from 'dompurify';
import aboutService from '../../services/about.service';
import './AboutSection.css';

const fadeLeft  = (delay = 0) => ({ hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut', delay } } });
const fadeRight = (delay = 0) => ({ hidden: { opacity: 0, x:  40 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut', delay } } });
const fadeUp    = (delay = 0) => ({ hidden: { opacity: 0, y:  30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay } } });

const AboutSection = ({ lang }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const { data, isLoading } = useQuery({ queryKey: ['about-public'], queryFn: aboutService.getAbout, staleTime: 5 * 60 * 1000 });

  const about = data?.data;
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const imageUrl = about?.image ? `${baseUrl}${about.image}` : null;

  const sanitize = (html) => ({ __html: DOMPurify.sanitize(html || '') });

  // Skeleton
  if (isLoading) {
    return (
      <section className="public-section about-section">
        <div className="about-grid">
          <div className="about-content">
            {[60, 180, 100, 40].map((h, i) => (
              <div key={i} className="skeleton" style={{ height: h, borderRadius: 12 }} />
            ))}
          </div>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 20 }} />
        </div>
      </section>
    );
  }

  // Hidden if no data
  if (!about?.companyName && !about?.description) return null;

  const contentAnim = lang === 'ar' ? fadeRight(0) : fadeLeft(0);
  const imageAnim   = lang === 'ar' ? fadeLeft(0.2) : fadeRight(0.2);

  return (
    <section className="public-section about-section" id="about" ref={ref}>
      <div className="about-grid">

        {/* ── Text Content ── */}
        <motion.div
          className="about-content"
          variants={contentAnim}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {/* Pill tag */}
          <div className="about-tag">
            <span className="about-tag-dot" />
            {t('من نحن', 'About Us')}
          </div>

          {/* Title — show arabicTitle in AR mode, companyName in EN */}
          <h2 className="about-title">
            <span className="text-accent">
              {lang === 'ar' && about.arabicTitle ? about.arabicTitle : about.companyName}
            </span>
          </h2>

          {/* Sub-name — show companyName in AR, englishName in EN */}
          {(lang === 'ar' ? about.companyName : about.englishName) && (
            <p className="about-english-name">
              {lang === 'ar' ? about.companyName : about.englishName}
            </p>
          )}

          {/* Rich-text description — use arabicDescription in AR mode if available */}
          {(() => {
            const desc = lang === 'ar' && about.arabicDescription
              ? about.arabicDescription
              : about.description;
            return desc
              ? <div className="tiptap-render" dangerouslySetInnerHTML={sanitize(desc)} />
              : null;
          })()}

          {/* CTA */}
          <a href="#contact" className="about-cta">
            {t('تواصل معنا', 'Contact Us')}
            <ArrowIcon size={18} />
          </a>
        </motion.div>

        {/* ── Image Frame ── */}
        <motion.div
          className="about-image-frame"
          variants={imageAnim}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {/* Decorative dots */}
          <div className="about-deco-dot about-deco-dot-1" />
          <div className="about-deco-dot about-deco-dot-2" />

          {/* Spinning border ring */}
          <div className="about-image-ring" />

          {/* Main card */}
          <div className="about-image-card">
            {/* Animated gradient top bar */}
            <div className="about-image-banner" />

            {/* Image display area */}
            <div className="about-image-display">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={about.companyName}
                  className="about-image"
                />
              ) : (
                <div className="about-image-placeholder-display">
                  <Wind size={64} style={{ color: 'var(--border-accent)' }} />
                  <p className="about-image-placeholder-text">{about.companyName}</p>
                </div>
              )}
            </div>

            {/* Card footer */}
            <div className="about-image-footer">
              <span className="about-image-footer-name">
                {about.companyName}
              </span>
              <span className="about-image-footer-badge">
                {t('شركة مرخصة', 'Licensed Co.')}
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
