import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LayoutTemplate, Plus, Trash2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import footerService from '../../services/footer.service';

const FooterPage = () => {
  const { lang } = useOutletContext();
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const qc = useQueryClient();

  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm({
    defaultValues: {
      companyDescriptionAr: '',
      companyDescriptionEn: '',
      copyrightAr: '',
      copyrightEn: '',
      quickLinks: [],
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control, name: 'quickLinks',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['footer-admin'],
    queryFn: footerService.get,
  });

  useEffect(() => {
    if (data?.data) {
      reset({
        companyDescriptionAr: data.data.companyDescriptionAr || '',
        companyDescriptionEn: data.data.companyDescriptionEn || '',
        copyrightAr: data.data.copyrightAr || '',
        copyrightEn: data.data.copyrightEn || '',
        quickLinks: data.data.quickLinks || [],
      });
    }
  }, [data, reset]);

  const updateMut = useMutation({
    mutationFn: footerService.update,
    onSuccess: () => {
      toast.success(t('تم الحفظ بنجاح', 'Saved successfully'));
      qc.invalidateQueries({ queryKey: ['footer-admin'] });
    },
    onError: () => toast.error(t('حدث خطأ', 'An error occurred')),
  });

  const onSubmit = (values) => {
    updateMut.mutate(values);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div>;
  }

  return (
    <div className="footer-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('تذييل الموقع (Footer)', 'Website Footer')}</h1>
          <p className="section-subtitle">{t('إدارة معلومات التذييل والروابط السريعة', 'Manage footer information and quick links')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        
        {/* Company Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutTemplate size={18} /> {t('معلومات الشركة', 'Company Information')}
          </h3>
          <div className="form-group">
            <label>{t('وصف الشركة المختصر (عربي)', 'Short Description (Arabic)')}</label>
            <textarea dir="rtl" rows={3} className="form-input" {...register('companyDescriptionAr')} />
          </div>
          <div className="form-group">
            <label>{t('وصف الشركة المختصر (إنجليزي)', 'Short Description (English)')}</label>
            <textarea dir="ltr" rows={3} className="form-input" {...register('companyDescriptionEn')} />
          </div>
        </div>

        {/* Quick Links */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="flex-between">
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={18} /> {t('الروابط السريعة', 'Quick Links')}
            </h3>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => appendLink({ labelAr: '', labelEn: '', path: '', isActive: true })}
            >
              <Plus size={14} /> {t('إضافة رابط', 'Add Link')}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('تفعيل', 'Active')}</th>
                  <th>{t('الاسم (عربي)', 'Label (Arabic)')}</th>
                  <th>{t('الاسم (إنجليزي)', 'Label (English)')}</th>
                  <th>{t('الرابط (Path)', 'Path')}</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {linkFields.map((field, idx) => (
                  <tr key={field.id}>
                    <td>
                      <input type="checkbox" style={{ width: 18, height: 18 }} {...register(`quickLinks.${idx}.isActive`)} />
                    </td>
                    <td><input dir="rtl" className="form-input" placeholder="مثال: الرئيسية" {...register(`quickLinks.${idx}.labelAr`, { required: true })} /></td>
                    <td><input dir="ltr" className="form-input" placeholder="e.g. Home" {...register(`quickLinks.${idx}.labelEn`, { required: true })} /></td>
                    <td><input dir="ltr" className="form-input" placeholder="#home or /path" {...register(`quickLinks.${idx}.path`, { required: true })} /></td>
                    <td>
                      <button type="button" className="btn btn-icon btn-danger" onClick={() => removeLink(idx)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {linkFields.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {t('لا توجد روابط.', 'No quick links.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Copyright */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} /> {t('حقوق النشر', 'Copyright Text')}
          </h3>
          <div className="form-group">
            <label>{t('نص حقوق النشر (عربي)', 'Copyright Text (Arabic)')}</label>
            <input dir="rtl" className="form-input" {...register('copyrightAr')} />
          </div>
          <div className="form-group">
            <label>{t('نص حقوق النشر (إنجليزي)', 'Copyright Text (English)')}</label>
            <input dir="ltr" className="form-input" {...register('copyrightEn')} />
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMut.isPending}>
            {updateMut.isPending && <span className="spinner" />}
            {t('حفظ التغييرات', 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FooterPage;
