import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Globe, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = ({ onMenuToggle, lang, onLangToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      navigate('/admin/login');
    } catch {
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  return (
    <header className="dashboard-navbar">
      {/* Right side — menu + brand */}
      <div className="navbar-start">
        <button
          className="navbar-menu-btn btn btn-icon btn-ghost"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          id="navbar-menu-toggle"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-brand">
          <span className="navbar-brand-name">
            {lang === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
          </span>
        </div>
      </div>

      {/* Left side — lang toggle + user */}
      <div className="navbar-end">
        {/* Language Toggle */}
        <button
          className="navbar-lang-btn btn btn-secondary btn-sm"
          onClick={onLangToggle}
          id="navbar-lang-toggle"
          title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
          <Globe size={15} />
          <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
        </button>

        {/* User dropdown */}
        <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="navbar-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.username || 'Admin'}</span>
            <span className="navbar-user-role">
              {lang === 'ar' ? 'مدير النظام' : 'Administrator'}
            </span>
          </div>
          <ChevronDown size={14} className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`} />

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="navbar-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="navbar-dropdown-header">
                <span className="navbar-dropdown-name">{user?.username}</span>
                <span className="navbar-dropdown-email">{user?.email}</span>
              </div>
              <div className="navbar-dropdown-divider" />
              <button
                className="navbar-dropdown-item navbar-dropdown-item--danger"
                onClick={handleLogout}
                id="navbar-logout-btn"
              >
                <LogOut size={15} />
                <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
