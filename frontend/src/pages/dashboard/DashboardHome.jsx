import { useOutletContext, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package, Images, Wrench, Grid3X3, Inbox, MailOpen,
  ArrowLeft, ArrowRight, Clock, Mail, User, Building,
  Info, Star, Layout, Settings, Phone,
} from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import statsService from '../../services/stats.service';
import './DashboardHome.css';

const quickNavItems = [
  { path: '/admin/about',         labelAr: 'من نحن',          labelEn: 'About Us',         icon: Info,    color: 'info' },
  { path: '/admin/why-choose-us', labelAr: 'لماذا تختارنا',  labelEn: 'Why Choose Us',    icon: Star,    color: 'warning' },
  { path: '/admin/services',      labelAr: 'الخدمات',         labelEn: 'Services',         icon: Wrench,  color: 'accent' },
  { path: '/admin/applications',  labelAr: 'التطبيقات',       labelEn: 'Applications',     icon: Grid3X3, color: 'success' },
  { path: '/admin/products',      labelAr: 'المنتجات',        labelEn: 'Products',         icon: Package, color: 'purple' },
  { path: '/admin/gallery',       labelAr: 'معرض الأعمال',    labelEn: 'Gallery',          icon: Images,  color: 'info' },
  { path: '/admin/contact',       labelAr: 'التواصل',         labelEn: 'Contact',          icon: Phone,   color: 'success' },
  { path: '/admin/inbox',         labelAr: 'صندوق الوارد',    labelEn: 'Inbox',            icon: Inbox,   color: 'danger' },
  { path: '/admin/footer',        labelAr: 'التذييل',         labelEn: 'Footer',           icon: Layout,  color: 'accent' },
  { path: '/admin/settings',      labelAr: 'الإعدادات',       labelEn: 'Settings',         icon: Settings,color: 'warning' },
];

const DashboardHome = () => {
  const { lang } = useOutletContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: statsService.getStats,
    retry: 2,
  });

  const stats = data?.stats || {};
  const recentMessages = data?.recentMessages || [];

  const statsCards = [
    { key: 'products',      titleAr: 'إجمالي المنتجات',      titleEn: 'Total Products',       icon: Package, color: 'accent',  value: stats.totalProducts  },
    { key: 'gallery',       titleAr: 'صور معرض الأعمال',     titleEn: 'Gallery Images',       icon: Images,  color: 'info',    value: stats.totalGallery   },
    { key: 'services',      titleAr: 'إجمالي الخدمات',       titleEn: 'Total Services',       icon: Wrench,  color: 'success', value: stats.totalServices  },
    { key: 'applications',  titleAr: 'إجمالي التطبيقات',     titleEn: 'Total Applications',   icon: Grid3X3, color: 'purple',  value: stats.totalApplications },
    { key: 'messages',      titleAr: 'إجمالي الرسائل',       titleEn: 'Total Messages',       icon: Inbox,   color: 'warning', value: stats.totalMessages  },
    { key: 'unread',        titleAr: 'رسائل غير مقروءة',     titleEn: 'Unread Messages',      icon: MailOpen,color: 'danger',  value: stats.totalUnread    },
  ];

  const t = (ar, en) => (lang === 'ar' ? ar : en);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="dashboard-home">
      {/* Page header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('لوحة التحكم', 'Dashboard')}</h1>
          <p className="section-subtitle">
            {t('مرحباً بك في لوحة التحكم الإدارية لـ SMG Turbo Fan',
               'Welcome to the SMG Turbo Fan Admin Dashboard')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="home-stats-grid">
        {statsCards.map((card) => (
          <StatsCard
            key={card.key}
            title={t(card.titleAr, card.titleEn)}
            value={isLoading ? undefined : (isError ? '—' : card.value)}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </section>

      <div className="home-bottom-grid">
        {/* Recent Messages */}
        <section className="home-messages card">
          <div className="home-section-head">
            <h2 className="home-section-title">
              <Inbox size={18} />
              {t('آخر الرسائل الواردة', 'Recent Inbox Messages')}
            </h2>
            <Link to="/admin/inbox" className="btn btn-ghost btn-sm">
              {t('عرض الكل', 'View All')} <ArrowIcon size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="home-messages-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="home-message-item home-message-skeleton">
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="home-empty-state">
              <Mail size={36} />
              <p>{t('لا توجد رسائل بعد', 'No messages yet')}</p>
            </div>
          ) : (
            <div className="home-messages-list">
              {recentMessages.map((msg) => (
                <Link
                  key={msg._id}
                  to={`/admin/inbox`}
                  className={`home-message-item ${!msg.isRead ? 'home-message-item--unread' : ''}`}
                >
                  <div className="home-message-avatar">
                    <User size={16} />
                  </div>
                  <div className="home-message-body">
                    <div className="home-message-top">
                      <span className="home-message-name">{msg.fullName}</span>
                      {!msg.isRead && <span className="badge badge-danger">{t('جديد', 'New')}</span>}
                    </div>
                    <span className="home-message-subject">{msg.subject}</span>
                    <span className="home-message-time">
                      <Clock size={12} /> {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick Navigation */}
        <section className="home-quicknav card">
          <div className="home-section-head">
            <h2 className="home-section-title">
              {t('الوصول السريع', 'Quick Access')}
            </h2>
          </div>
          <div className="home-quicknav-grid">
            {quickNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className="home-quicknav-item">
                  <Icon size={18} />
                  <span>{t(item.labelAr, item.labelEn)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardHome;
