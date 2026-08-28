import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PublicNavbar from '../../components/public/PublicNavbar';
import AboutSection from '../../components/public/AboutSection';
import WhyChooseUsSection from '../../components/public/WhyChooseUsSection';
import ServicesSection from '../../components/public/ServicesSection';
import ApplicationsSection from '../../components/public/ApplicationsSection';
import ProductsSection from '../../components/public/ProductsSection';
import GallerySection from '../../components/public/GallerySection';
import ContactSection from '../../components/public/ContactSection';
import settingsService from '../../services/settings.service';
import './LandingPage.css';

const LandingPage = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('smg_lang') || 'ar');

  // ── Global settings (theme + SEO) ────────────────────────────────────
  const { data: settingsData } = useQuery({
    queryKey: ['website-settings-public'],
    queryFn: settingsService.get,
    staleTime: 5 * 60 * 1000,
  });

  // Apply dynamic theme colors to CSS custom properties
  useEffect(() => {
    const theme = settingsData?.data?.theme;
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primaryColor)   root.style.setProperty('--text-primary', theme.primaryColor);
    if (theme.accentColor)    root.style.setProperty('--accent-500', theme.accentColor);
    if (theme.secondaryColor) root.style.setProperty('--text-secondary', theme.secondaryColor);
  }, [settingsData]);

  // Apply dynamic SEO meta tags
  useEffect(() => {
    const s = settingsData?.data;
    if (!s) return;
    const titleField = lang === 'ar' ? s.metaTitleAr : s.metaTitleEn;
    const descField  = lang === 'ar' ? s.metaDescriptionAr : s.metaDescriptionEn;
    const kwField    = lang === 'ar' ? s.metaKeywordsAr : s.metaKeywordsEn;
    if (titleField) document.title = titleField;
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    if (descField) setMeta('description', descField);
    if (kwField)   setMeta('keywords', kwField);
  }, [settingsData, lang]);

  // Inject Google Analytics / GTM / Pixel scripts
  useEffect(() => {
    const analytics = settingsData?.data?.analytics;
    if (!analytics) return;
    // Google Analytics 4
    if (analytics.googleAnalyticsId && !document.querySelector(`#ga-${analytics.googleAnalyticsId}`)) {
      const s = document.createElement('script');
      s.id = `ga-${analytics.googleAnalyticsId}`;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}`;
      s.async = true;
      document.head.appendChild(s);
      const inline = document.createElement('script');
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.googleAnalyticsId}');`;
      document.head.appendChild(inline);
    }
    // Google Tag Manager
    if (analytics.googleTagManagerId && !document.querySelector(`#gtm-${analytics.googleTagManagerId}`)) {
      const s = document.createElement('script');
      s.id = `gtm-${analytics.googleTagManagerId}`;
      s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.googleTagManagerId}');`;
      document.head.appendChild(s);
    }
  }, [settingsData]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir              = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('smg_lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');

  return (
    <div className="landing-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ── Fixed Navbar ── */}
      <PublicNavbar lang={lang} onLangToggle={toggleLang} />

      {/* ── Content (offset for navbar) ── */}
      <main className="landing-main">
        <AboutSection lang={lang} />
        <WhyChooseUsSection lang={lang} />
        <ServicesSection lang={lang} />
        <ApplicationsSection lang={lang} />
        <ProductsSection lang={lang} />
        <GallerySection lang={lang} />
        <ContactSection lang={lang} />
      </main>
    </div>
  );
};

export default LandingPage;
