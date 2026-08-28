import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Menu, X, Wind } from 'lucide-react';
import './PublicNavbar.css';

const navLinks = [
  { href: '#about',          labelAr: 'من نحن',           labelEn: 'About Us' },
  { href: '#why-choose-us', labelAr: 'لماذا تختارنا',   labelEn: 'Why Choose Us' },
  { href: '#services',      labelAr: 'الخدمات',          labelEn: 'Services' },
  { href: '#applications',  labelAr: 'التطبيقات',        labelEn: 'Applications' },
  { href: '#products',      labelAr: 'المنتجات',          labelEn: 'Products' },
  { href: '#gallery',       labelAr: 'معرض الأعمال',     labelEn: 'Gallery' },
  { href: '#contact',       labelAr: 'تواصل معنا',        labelEn: 'Contact' },
];

const PublicNavbar = ({ lang, onLangToggle }) => {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = (ar, en) => (lang === 'ar' ? ar : en);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLinkClick = () => setMobileOpen(false);

  return (
    <>
      <header className={`public-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="public-navbar-inner">
          {/* ── Logo ── */}
          <Link to="/" className="public-nav-logo" onClick={handleLinkClick}>
            <div className="public-nav-logo-icon">
              <Wind size={20} />
            </div>
            <div className="public-nav-logo-text">
              <span className="public-nav-logo-primary">SMG</span>
              <span className="public-nav-logo-secondary">Turbo Fan</span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="public-nav-links">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="public-nav-link"
              >
                {t(link.labelAr, link.labelEn)}
              </a>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="public-nav-actions">
            <button
              className="public-nav-lang-btn"
              onClick={onLangToggle}
              title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe size={15} />
              <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            {/* ── Mobile Hamburger ── */}
            <button
              className="public-nav-hamburger"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <div className={`public-nav-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        <nav className="public-nav-mobile-links">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="public-nav-mobile-link"
              onClick={handleLinkClick}
            >
              {t(link.labelAr, link.labelEn)}
            </a>
          ))}
        </nav>
      </div>
      {mobileOpen && <div className="public-nav-mobile-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
};

export default PublicNavbar;
