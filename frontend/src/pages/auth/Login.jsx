import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, Wind, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError]     = useState('');
  const { login, isAuthenticated }      = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async ({ identifier, password }) => {
    setLoginError('');
    try {
      await login(identifier, password);
      toast.success('مرحباً بك في لوحة التحكم 🎉');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'بيانات الاعتماد غير صحيحة';
      setLoginError(msg);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="login-orb login-orb--1" />
        <div className="login-orb login-orb--2" />
        <div className="login-orb login-orb--3" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Wind size={28} />
          </div>
          <div>
            <h1 className="login-logo-title">SMG Turbo Fan</h1>
            <p className="login-logo-sub">لوحة التحكم الإدارية</p>
          </div>
        </div>

        <div className="login-divider" />

        <div className="login-header">
          <h2 className="login-title">تسجيل الدخول</h2>
          <p className="login-subtitle">أدخل بياناتك للوصول إلى لوحة التحكم</p>
        </div>

        {/* Error alert */}
        {loginError && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          {/* Identifier */}
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              البريد الإلكتروني أو اسم المستخدم
            </label>
            <input
              id="identifier"
              type="text"
              className={`form-input ${errors.identifier ? 'error' : ''}`}
              placeholder="admin@smg.com"
              autoComplete="username"
              dir="ltr"
              {...register('identifier', {
                required: 'هذا الحقل مطلوب',
              })}
            />
            {errors.identifier && (
              <span className="form-error">{errors.identifier.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              كلمة المرور
            </label>
            <div className="login-password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
                {...register('password', {
                  required: 'كلمة المرور مطلوبة',
                  minLength: { value: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
                })}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg login-submit-btn"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <><span className="spinner" />جاري تسجيل الدخول...</>
            ) : (
              <><LogIn size={18} />تسجيل الدخول</>
            )}
          </button>
        </form>

        <p className="login-footer-note">
          لوحة التحكم الإدارية — SMG Turbo Fan Central Ventilation Systems
        </p>
      </div>
    </div>
  );
};

export default Login;
