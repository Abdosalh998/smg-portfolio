import { useOutletContext } from 'react-router-dom';
import { Construction } from 'lucide-react';

/**
 * Placeholder page for modules not yet built.
 * Will be replaced as each prompt is implemented.
 */
const PlaceholderPage = ({ titleAr, titleEn, icon: Icon }) => {
  const { lang } = useOutletContext();
  const t = (ar, en) => (lang === 'ar' ? ar : en);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 className="section-title">{t(titleAr, titleEn)}</h1>
        <p className="section-subtitle" style={{ marginTop: 'var(--space-2)' }}>
          {t('سيتم بناء هذه الصفحة في الطلب القادم', 'This module will be built in the next prompt')}
        </p>
      </div>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-16)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
          color: 'var(--text-muted)',
        }}
      >
        <Construction size={48} style={{ color: 'var(--accent-400)' }} />
        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
          {t('قيد الإنشاء', 'Under Construction')}
        </p>
        <p style={{ fontSize: 'var(--text-sm)', textAlign: 'center' }}>
          {t(
            `صفحة "${titleAr}" ستكون متاحة قريباً`,
            `The "${titleEn}" module will be available soon`
          )}
        </p>
      </div>
    </div>
  );
};

export const WhyChooseUsPage  = () => <PlaceholderPage titleAr="لماذا تختارنا"   titleEn="Why Choose Us"     />;
export const ServicesPage     = () => <PlaceholderPage titleAr="الخدمات"          titleEn="Services"          />;
export const ApplicationsPage = () => <PlaceholderPage titleAr="التطبيقات"        titleEn="Applications"      />;
export const ProductsPage     = () => <PlaceholderPage titleAr="المنتجات"         titleEn="Products"          />;
export const GalleryPage      = () => <PlaceholderPage titleAr="معرض الأعمال"     titleEn="Gallery"           />;
export const ContactPage      = () => <PlaceholderPage titleAr="معلومات التواصل"  titleEn="Contact Info"      />;
export const InboxPage        = () => <PlaceholderPage titleAr="صندوق الوارد"     titleEn="Inbox"             />;
export const FooterPage       = () => <PlaceholderPage titleAr="التذييل"          titleEn="Footer"            />;
export const SettingsPage     = () => <PlaceholderPage titleAr="إعدادات الموقع"   titleEn="Website Settings"  />;
