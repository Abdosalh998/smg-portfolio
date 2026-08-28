import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const [lang, setLang] = useState(() => localStorage.getItem('smg_lang') || 'ar');

  useEffect(() => {
    // Apply language to document
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('smg_lang', lang);
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-is-open' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} lang={lang} />
      <Navbar onMenuToggle={toggleSidebar} lang={lang} onLangToggle={toggleLang} />
      <main className="dashboard-main">
        <div className="dashboard-content page-enter">
          <Outlet context={{ lang }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
