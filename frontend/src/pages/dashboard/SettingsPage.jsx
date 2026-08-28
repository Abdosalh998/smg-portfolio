import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Settings, Globe, Search, Palette, Activity, Upload, Image as ImageIcon } from 'lucide-react';
import settingsService from '../../services/settings.service';
import './SettingsPage.css';

const SettingsPage = () => {
  const { lang } = useOutletContext();
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef(null);
  const [uploadType, setUploadType] = useState(null); // 'logo' or 'favicon'

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      websiteNameAr: '', websiteNameEn: '',
      websiteTitleAr: '', websiteTitleEn: '',
      websiteDescriptionAr: '', websiteDescriptionEn: '',
      metaTitleAr: '', metaTitleEn: '',
      metaDescriptionAr: '', metaDescriptionEn: '',
      metaKeywordsAr: '', metaKeywordsEn: '',
      analytics: { googleAnalyticsId: '', googleTagManagerId: '', facebookPixelId: '' },
      theme: { primaryColor: '#050505', secondaryColor: '#64748b', accentColor: '#e60000' }
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings-admin'],
    queryFn: settingsService.get,
  });

  const settingsData = data?.data;

  useEffect(() => {
    if (settingsData) {
      reset({
        websiteNameAr: settingsData.websiteNameAr || '',
        websiteNameEn: settingsData.websiteNameEn || '',
        websiteTitleAr: settingsData.websiteTitleAr || '',
        websiteTitleEn: settingsData.websiteTitleEn || '',
        websiteDescriptionAr: settingsData.websiteDescriptionAr || '',
        websiteDescriptionEn: settingsData.websiteDescriptionEn || '',
        metaTitleAr: settingsData.metaTitleAr || '',
        metaTitleEn: settingsData.metaTitleEn || '',
        metaDescriptionAr: settingsData.metaDescriptionAr || '',
        metaDescriptionEn: settingsData.metaDescriptionEn || '',
        metaKeywordsAr: settingsData.metaKeywordsAr || '',
        metaKeywordsEn: settingsData.metaKeywordsEn || '',
        analytics: settingsData.analytics || { googleAnalyticsId: '', googleTagManagerId: '', facebookPixelId: '' },
        theme: settingsData.theme || { primaryColor: '#050505', secondaryColor: '#64748b', accentColor: '#e60000' }
      });
    }
  }, [settingsData, reset]);

  const updateMut = useMutation({
    mutationFn: settingsService.update,
    onSuccess: () => {
      toast.success(t('تم حفظ الإعدادات', 'Settings saved'));
      qc.invalidateQueries({ queryKey: ['settings-admin'] });
      // Tell public app to reload settings if they rely on query caching
      qc.invalidateQueries({ queryKey: ['website-settings-public'] }); 
    },
    onError: () => toast.error(t('حدث خطأ', 'An error occurred')),
  });

  const uploadMut = useMutation({
    mutationFn: ({ file, field }) => settingsService.uploadMedia(file, field),
    onSuccess: () => {
      toast.success(t('تم الرفع بنجاح', 'Uploaded successfully'));
      qc.invalidateQueries({ queryKey: ['settings-admin'] });
    },
    onError: () => toast.error(t('فشل الرفع', 'Upload failed')),
  });

  const onSubmit = (values) => {
    updateMut.mutate(values);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && uploadType) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('حجم الملف كبير جداً', 'File is too large'));
        return;
      }
      uploadMut.mutate({ file, field: uploadType });
    }
    e.target.value = '';
  };

  const triggerUpload = (type) => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const tabs = [
    { id: 'general', icon: Globe, label: t('عام', 'General') },
    { id: 'seo', icon: Search, label: t('محركات البحث (SEO)', 'SEO') },
    { id: 'theme', icon: Palette, label: t('المظهر (Theme)', 'Theme') },
    { id: 'analytics', icon: Activity, label: t('التحليلات (Analytics)', 'Analytics') },
  ];

  if (isLoading) {
    return <div className="flex-center" style={{ padding: 40 }}><div className="spinner spinner-lg" /></div>;
  }

  return (
    <div className="settings-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('إعدادات الموقع', 'Website Settings')}</h1>
          <p className="section-subtitle">{t('إدارة الهوية، الألوان، وتحسين محركات البحث', 'Manage branding, colors, and SEO')}</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-tabs card">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="settings-content">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* General Settings */}
            <div className="card" style={{ display: activeTab === 'general' ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('اسم الموقع (عربي)', 'Website Name (Arabic)')}</label>
                  <input dir="rtl" className="form-input" {...register('websiteNameAr')} />
                </div>
                <div className="form-group">
                  <label>{t('اسم الموقع (إنجليزي)', 'Website Name (English)')}</label>
                  <input dir="ltr" className="form-input" {...register('websiteNameEn')} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('وصف الموقع (عربي)', 'Website Description (Arabic)')}</label>
                  <textarea dir="rtl" rows={3} className="form-input" {...register('websiteDescriptionAr')} />
                </div>
                <div className="form-group">
                  <label>{t('وصف الموقع (إنجليزي)', 'Website Description (English)')}</label>
                  <textarea dir="ltr" rows={3} className="form-input" {...register('websiteDescriptionEn')} />
                </div>
              </div>

              {/* Branding */}
              <div className="branding-section">
                <div className="branding-item">
                  <div className="branding-preview">
                    {settingsData?.logo ? (
                      <img src={`http://localhost:5000${settingsData.logo}`} alt="Logo" className="preview-img" />
                    ) : (
                      <ImageIcon size={32} color="var(--text-muted)" />
                    )}
                  </div>
                  <div>
                    <h4>{t('شعار الموقع (Logo)', 'Website Logo')}</h4>
                    <p>{t('يستخدم في الهيدر والفوتر', 'Used in header and footer')}</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => triggerUpload('logo')} disabled={uploadMut.isPending}>
                      <Upload size={14} /> {t('تغيير الشعار', 'Change Logo')}
                    </button>
                  </div>
                </div>
                
                <div className="branding-item">
                  <div className="branding-preview favicon-preview">
                    {settingsData?.favicon ? (
                      <img src={`http://localhost:5000${settingsData.favicon}`} alt="Favicon" className="preview-img" />
                    ) : (
                      <ImageIcon size={24} color="var(--text-muted)" />
                    )}
                  </div>
                  <div>
                    <h4>{t('أيقونة الموقع (Favicon)', 'Favicon')}</h4>
                    <p>{t('تظهر في تبويبات المتصفح (16x16 أو 32x32)', 'Browser tab icon')}</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => triggerUpload('favicon')} disabled={uploadMut.isPending}>
                      <Upload size={14} /> {t('تغيير الأيقونة', 'Change Favicon')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card" style={{ display: activeTab === 'seo' ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="alert alert-info">
                {t('هذه الإعدادات تساعد في تحسين ظهور موقعك في جوجل.', 'These settings help improve your search ranking on Google.')}
              </div>
              <div className="form-group">
                <label>{t('عنوان الميتا (عربي)', 'Meta Title (Arabic)')}</label>
                <input dir="rtl" className="form-input" placeholder="SMG Turbo Fan | الصفحة الرئيسية" {...register('metaTitleAr')} />
              </div>
              <div className="form-group">
                <label>{t('عنوان الميتا (إنجليزي)', 'Meta Title (English)')}</label>
                <input dir="ltr" className="form-input" placeholder="SMG Turbo Fan | Home" {...register('metaTitleEn')} />
              </div>
              <div className="form-group">
                <label>{t('وصف الميتا (عربي)', 'Meta Description (Arabic)')}</label>
                <textarea dir="rtl" rows={2} className="form-input" {...register('metaDescriptionAr')} />
              </div>
              <div className="form-group">
                <label>{t('وصف الميتا (إنجليزي)', 'Meta Description (English)')}</label>
                <textarea dir="ltr" rows={2} className="form-input" {...register('metaDescriptionEn')} />
              </div>
              <div className="form-group">
                <label>{t('الكلمات المفتاحية (عربي/إنجليزي - مفصولة بفاصلة)', 'Meta Keywords (Comma separated)')}</label>
                <input className="form-input" placeholder="تهوية مركزية, مراوح, ventilation, fans" {...register('metaKeywordsAr')} />
              </div>
            </div>

            {/* Theme Settings */}
            <div className="card" style={{ display: activeTab === 'theme' ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="alert alert-warning">
                {t('تغيير الألوان هنا سينعكس فوراً على الموقع بالكامل (الزرار، الروابط، الخ).', 'Changing colors here will immediately reflect across the entire website.')}
              </div>
              
              <div className="color-pickers">
                <div className="form-group">
                  <label>{t('اللون الأساسي (Primary Color)', 'Primary Color')}</label>
                  <div className="color-input-wrap">
                    <input type="color" className="color-picker" {...register('theme.primaryColor')} />
                    <input type="text" dir="ltr" className="form-input" {...register('theme.primaryColor')} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('اللون الثانوي (Secondary Color)', 'Secondary Color')}</label>
                  <div className="color-input-wrap">
                    <input type="color" className="color-picker" {...register('theme.secondaryColor')} />
                    <input type="text" dir="ltr" className="form-input" {...register('theme.secondaryColor')} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('لون التمييز (Accent Color)', 'Accent Color (e.g. Red)')}</label>
                  <div className="color-input-wrap">
                    <input type="color" className="color-picker" {...register('theme.accentColor')} />
                    <input type="text" dir="ltr" className="form-input" {...register('theme.accentColor')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="card" style={{ display: activeTab === 'analytics' ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="form-group">
                <label>Google Analytics ID</label>
                <input dir="ltr" className="form-input" placeholder="G-XXXXXXXXXX" {...register('analytics.googleAnalyticsId')} />
              </div>
              <div className="form-group">
                <label>Google Tag Manager ID</label>
                <input dir="ltr" className="form-input" placeholder="GTM-XXXXXXX" {...register('analytics.googleTagManagerId')} />
              </div>
              <div className="form-group">
                <label>Facebook Pixel ID</label>
                <input dir="ltr" className="form-input" placeholder="123456789012345" {...register('analytics.facebookPixelId')} />
              </div>
            </div>

            {/* Submit Action */}
            <div className="settings-footer">
              <button type="submit" className="btn btn-primary" disabled={updateMut.isPending}>
                {updateMut.isPending && <span className="spinner" />}
                {t('حفظ الإعدادات', 'Save Settings')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/x-icon"
        onChange={handleFileChange} 
      />
    </div>
  );
};

export default SettingsPage;
