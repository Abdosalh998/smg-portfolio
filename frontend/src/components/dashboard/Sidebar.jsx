import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Info, Star, Wrench, Grid3X3,
  Package, Images, Phone, Inbox, LayoutTemplate, Settings,
  X, Wind,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/admin',               icon: LayoutDashboard, labelAr: 'لوحة التحكم',        labelEn: 'Dashboard' },
  { path: '/admin/about',         icon: Info,            labelAr: 'من نحن',              labelEn: 'About Us' },
  { path: '/admin/why-choose-us', icon: Star,            labelAr: 'لماذا تختارنا',        labelEn: 'Why Choose Us' },
  { path: '/admin/services',      icon: Wrench,          labelAr: 'الخدمات',             labelEn: 'Services' },
  { path: '/admin/applications',  icon: Grid3X3,         labelAr: 'التطبيقات',            labelEn: 'Applications' },
  { path: '/admin/products',      icon: Package,         labelAr: 'المنتجات',             labelEn: 'Products' },
  { path: '/admin/gallery',       icon: Images,          labelAr: 'معرض الأعمال',         labelEn: 'Gallery' },
  { path: '/admin/contact',       icon: Phone,           labelAr: 'معلومات التواصل',      labelEn: 'Contact Info' },
  { path: '/admin/inbox',         icon: Inbox,           labelAr: 'صندوق الوارد',         labelEn: 'Inbox', badge: true },
  { path: '/admin/settings',      icon: Settings,        labelAr: 'الإعدادات',             labelEn: 'Settings' },
];

const Sidebar = ({ isOpen, onClose, lang = 'ar', unreadCount = 0 }) => {
  return (
    <>
      {/* Overlay — only matters on mobile, handled by CSS display */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        {/* ── Logo ────────────────────────────────────────────── */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wind size={20} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-primary">SMG</span>
            <span className="sidebar-logo-secondary">Turbo Fan</span>
          </div>
          {/* Close button always visible so users can collapse on any screen */}
          <button className="sidebar-close-btn" onClick={onClose} title="Close sidebar">
            <X size={16} />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────────────────── */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
                    }
                    onClick={() => {
                      // On mobile close after navigation
                      if (window.innerWidth <= 768) onClose();
                    }}
                  >
                    <span className="sidebar-nav-icon">
                      <Icon size={17} />
                    </span>
                    <span className="sidebar-nav-label">
                      {lang === 'ar' ? item.labelAr : item.labelEn}
                    </span>
                    {item.badge && unreadCount > 0 && (
                      <span className="sidebar-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer removed by request ── */}

      </aside>
    </>
  );
};

export default Sidebar;
