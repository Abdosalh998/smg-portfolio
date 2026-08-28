import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useForm } from 'react-hook-form';
import {
  Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle,
} from 'lucide-react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from '../common/SocialIcons';
import contactInfoService from '../../services/contactInfo.service';
import inboxService from '../../services/inbox.service';
import './ContactSection.css';

const ContactSection = ({ lang }) => {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data } = useQuery({
    queryKey: ['contact-info-public'],
    queryFn: contactInfoService.get,
    staleTime: 10 * 60 * 1000,
  });

  const info = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      setSubmitError('');
      await inboxService.send(values);
      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(t('حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.', 'An error occurred. Please try again.'));
    }
  };

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
  };

  const hasSocials = info?.socialLinks && Object.values(info.socialLinks).some(Boolean);

  return (
    <section className="public-section contact-section" id="contact" ref={ref}>
      <div className="container">
        {/* Head */}
        <motion.div
          className="contact-head"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="about-tag">
            <span className="about-tag-dot" />
            {t('اتصل بنا', 'Contact Us')}
          </span>
          <h2 className="contact-title">{t('تواصل معنا', 'Get In Touch')}</h2>
          <p className="contact-subtitle">
            {t(
              'نحن هنا للإجابة على استفساراتكم وتقديم أفضل الحلول لاحتياجاتكم',
              'We are here to answer your inquiries and provide the best solutions for your needs'
            )}
          </p>
        </motion.div>

        <div className="contact-layout" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* ── Info Panel ── */}
          <motion.div
            className="contact-info-panel"
            initial={{ opacity: 0, x: lang === 'ar' ? 40 : -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="contact-info-card">
              {/* Phone */}
              {info?.phone?.length > 0 && (
                <div className="contact-info-item">
                  <div className="contact-info-icon"><Phone size={20} /></div>
                  <div className="contact-info-content">
                    <div className="contact-info-label">{t('الهاتف', 'Phone')}</div>
                    <div className="contact-info-value">
                      {info.phone.map((p, i) => (
                        <div key={i}><a href={`tel:${p}`}>{p}</a></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              {info?.email && (
                <div className="contact-info-item">
                  <div className="contact-info-icon"><Mail size={20} /></div>
                  <div className="contact-info-content">
                    <div className="contact-info-label">{t('البريد الإلكتروني', 'Email')}</div>
                    <div className="contact-info-value">
                      <a href={`mailto:${info.email}`}>{info.email}</a>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {(info?.addressAr || info?.addressEn) && (
                <div className="contact-info-item">
                  <div className="contact-info-icon"><MapPin size={20} /></div>
                  <div className="contact-info-content">
                    <div className="contact-info-label">{t('العنوان', 'Address')}</div>
                    <div className="contact-info-value">
                      {lang === 'ar' ? info.addressAr : info.addressEn}
                    </div>
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {(info?.workingHoursAr || info?.workingHoursEn) && (
                <div className="contact-info-item">
                  <div className="contact-info-icon"><Clock size={20} /></div>
                  <div className="contact-info-content">
                    <div className="contact-info-label">{t('أوقات العمل', 'Working Hours')}</div>
                    <div className="contact-info-value">
                      {lang === 'ar' ? info.workingHoursAr : info.workingHoursEn}
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp button */}
              {info?.whatsapp && (
                <a
                  href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-whatsapp-btn"
                >
                  <MessageSquare size={18} />
                  {t('تواصل عبر واتساب', 'Chat on WhatsApp')}
                </a>
              )}

              {/* Social Links */}
              {hasSocials && (
                <div className="contact-social-row">
                  {Object.entries(info.socialLinks).map(([key, url]) => {
                    if (!url) return null;
                    const Icon = socialIcons[key];
                    if (!Icon) return null;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="contact-social-link">
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Google Maps */}
            {info?.googleMapsUrl && (
              <div className="contact-map">
                {(info.googleMapsUrl.includes('embed') || info.googleMapsUrl.includes('pb=')) ? (
                  <iframe
                    src={info.googleMapsUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location"
                  />
                ) : (
                  <div className="contact-map-placeholder">
                    <MapPin size={32} />
                    <p style={{ textAlign: 'center', margin: '0 10px' }}>
                      {t('عرض الموقع على خرائط جوجل', 'View location on Google Maps')}
                    </p>
                    <a href={info.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      {t('فتح الخريطة', 'Open Map')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ── Form Panel ── */}
          <motion.div
            className="contact-form-panel"
            initial={{ opacity: 0, x: lang === 'ar' ? -40 : 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="contact-form-title">{t('أرسل لنا رسالة', 'Send Us a Message')}</h3>

            {submitted ? (
              <div className="contact-success-msg">
                <CheckCircle size={22} />
                <div>
                  <strong>{t('تم الإرسال بنجاح!', 'Message Sent Successfully!')}</strong>
                  <br />
                  {t('سنتواصل معك في أقرب وقت ممكن.', 'We will get back to you as soon as possible.')}
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="contact-form-row">
                  <div>
                    <input
                      className={`contact-input${errors.fullName ? ' error' : ''}`}
                      placeholder={`${t('الاسم الكامل', 'Full Name')} *`}
                      {...register('fullName', { required: true })}
                    />
                    {errors.fullName && <div className="contact-field-error">{t('مطلوب', 'Required')}</div>}
                  </div>
                  <div>
                    <input
                      className="contact-input"
                      placeholder={t('اسم الشركة (اختياري)', 'Company Name (Optional)')}
                      {...register('companyName')}
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div>
                    <input
                      type="tel"
                      className={`contact-input${errors.phone ? ' error' : ''}`}
                      placeholder={`${t('رقم الهاتف', 'Phone Number')} *`}
                      {...register('phone', { required: true, pattern: /^[\d\s\+\-\(\)]{7,20}$/ })}
                    />
                    {errors.phone && <div className="contact-field-error">{t('رقم غير صالح', 'Invalid phone')}</div>}
                  </div>
                  <div>
                    <input
                      type="email"
                      className={`contact-input${errors.email ? ' error' : ''}`}
                      placeholder={`${t('البريد الإلكتروني', 'Email Address')} *`}
                      {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                    />
                    {errors.email && <div className="contact-field-error">{t('بريد غير صالح', 'Invalid email')}</div>}
                  </div>
                </div>

                <div>
                  <input
                    className={`contact-input${errors.subject ? ' error' : ''}`}
                    placeholder={`${t('الموضوع', 'Subject')} *`}
                    {...register('subject', { required: true })}
                  />
                  {errors.subject && <div className="contact-field-error">{t('مطلوب', 'Required')}</div>}
                </div>

                <div className="contact-textarea-wrapper">
                  <textarea
                    className={`contact-input contact-textarea${errors.message ? ' error' : ''}`}
                    placeholder={`${t('الرسالة', 'Message')} *`}
                    {...register('message', { required: true, minLength: 10 })}
                  />
                  {errors.message && <div className="contact-field-error">{t('الرسالة قصيرة جداً', 'Message too short')}</div>}
                </div>

                {submitError && (
                  <div style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>{submitError}</div>
                )}

                <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                  {isSubmitting
                    ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    : <><Send size={18} /> {t('إرسال الرسالة', 'Send Message')}</>
                  }
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
