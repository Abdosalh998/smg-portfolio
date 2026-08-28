import { useQuery } from '@tanstack/react-query';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from '../common/SocialIcons';
import footerService from '../../services/footer.service';
import settingsService from '../../services/settings.service';
import contactInfoService from '../../services/contactInfo.service';
import './Footer.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const Footer = ({ lang }) => {
  const isAr = lang === 'ar';
  const t = (ar, en) => isAr ? ar : en;

  const { data: footerData }   = useQuery({ queryKey: ['footer-public'],           queryFn: footerService.get,      staleTime: 5 * 60 * 1000 });
  const { data: settingsData } = useQuery({ queryKey: ['website-settings-public'], queryFn: settingsService.get,    staleTime: 5 * 60 * 1000 });
  const { data: contactData }  = useQuery({ queryKey: ['contact-info-public'],     queryFn: contactInfoService.get, staleTime: 5 * 60 * 1000 });

  const footer   = footerData?.data;
  const settings = settingsData?.data;
  const contact  = contactData?.data;

  const activeLinks = footer?.quickLinks?.filter(l => l.isActive) || [];
  const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, twitter: Twitter, youtube: Youtube };
  const hasSocials  = contact?.socialLinks && Object.values(contact.socialLinks).some(Boolean);

  const currentYear = new Date().getFullYear();
  const copyright   = isAr ? footer?.copyrightAr : footer?.copyrightEn;

  return (
    <footer className="public-footer">
      {/* ── Top accent line ── */}
      <div className="footer-top-bar" />

      {/* ── Main Grid ── */}
      <div className="footer-main">
        <div className="container footer-grid" dir={isAr ? 'rtl' : 'ltr'}>

          {/* ▌Col 1 — Brand ▌ */}
          <div className="footer-col footer-col--brand">
            {settings?.logo ? (
              <img src={`${API_BASE}${settings.logo}`} alt="SMG Logo" className="footer-logo-img" />
            ) : (
              <div className="footer-brand-mark">
                <div className="footer-brand-badge">
                  <span className="footer-brand-badge-text">SMG</span>
                </div>
                <div>
                  <div className="footer-brand-name">SMG Turbo Fan</div>
                  <div className="footer-brand-sub">{t('أنظمة التهوية المركزية', 'Central Ventilation Systems')}</div>
                </div>
              </div>
            )}

            <p className="footer-tagline">
              {(isAr ? footer?.companyDescriptionAr : footer?.companyDescriptionEn) ||
                t('الشركة الرائدة في تصنيع وتركيب أنظمة التهوية المركزية الصناعية.', 'Egypt\'s leading manufacturer of industrial central ventilation systems.')}
            </p>

            {contact?.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-whatsapp-btn"
              >
                <span>💬</span>
                <span>{t('تواصل عبر واتساب', 'Chat on WhatsApp')}</span>
              </a>
            )}
          </div>

          {/* ▌Col 2 — Quick Links ▌ */}
          {activeLinks.length > 0 && (
            <div className="footer-col">
              <div className="footer-col-title">
                <span className="footer-title-accent" />
                {t('روابط سريعة', 'Quick Links')}
              </div>
              <ul className="footer-nav">
                {activeLinks.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.path} className="footer-nav-link">
                      <span className="footer-nav-arrow">{isAr ? '←' : '→'}</span>
                      {isAr ? link.labelAr : link.labelEn}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ▌Col 3 — Contact ▌ */}
          <div className="footer-col">
            <div className="footer-col-title">
              <span className="footer-title-accent" />
              {t('تواصل معنا', 'Contact Us')}
            </div>
            <div className="footer-contacts">
              {(contact?.addressAr || contact?.addressEn) && (
                <div className="footer-contact-row">
                  <span className="fc-icon">📍</span>
                  <span className="fc-text">{isAr ? contact.addressAr : contact.addressEn}</span>
                </div>
              )}
              {contact?.phone?.[0] && (
                <div className="footer-contact-row">
                  <span className="fc-icon">📞</span>
                  <div className="fc-text" dir="ltr">
                    <a href={`tel:${contact.phone[0]}`}>{contact.phone[0]}</a>
                    {contact.phone?.[1] && <><br /><a href={`tel:${contact.phone[1]}`}>{contact.phone[1]}</a></>}
                  </div>
                </div>
              )}
              {contact?.email && (
                <div className="footer-contact-row">
                  <span className="fc-icon">✉️</span>
                  <span className="fc-text">
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </span>
                </div>
              )}
              {(contact?.workingHoursAr || contact?.workingHoursEn) && (
                <div className="footer-contact-row">
                  <span className="fc-icon">🕒</span>
                  <span className="fc-text">{isAr ? contact.workingHoursAr : contact.workingHoursEn}</span>
                </div>
              )}
            </div>
          </div>

          {/* ▌Col 4 — Social ▌ */}
          {hasSocials && (
            <div className="footer-col">
              <div className="footer-col-title">
                <span className="footer-title-accent" />
                {t('تابعنا', 'Follow Us')}
              </div>
              <div className="footer-social-grid">
                {Object.entries(contact.socialLinks).map(([key, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[key];
                  if (!Icon) return null;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title={key}>
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="container footer-bottom-inner">
          <span className="footer-copy">
            {copyright || `© ${currentYear} S.M.G Turbo Fan Central Ventilation Systems.`}
          </span>
          <span className="footer-dev">
            {t('تطوير', 'Developed by')}&nbsp;<strong>A Squared</strong>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
