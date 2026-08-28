import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Phone, Mail, MapPin, Clock, Globe, Plus, Trash2, MessageSquare,
} from 'lucide-react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from '../../components/common/SocialIcons';
import contactInfoService from '../../services/contactInfo.service';
import './ContactPage.css';

const ContactPage = () => {
  const { lang } = useOutletContext();
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const qc = useQueryClient();

  const { register, handleSubmit, reset, control, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      companyNameAr: '', companyNameEn: '',
      addressAr: '', addressEn: '',
      phone: [''],
      whatsapp: '', email: '',
      workingHoursAr: '', workingHoursEn: '',
      googleMapsUrl: '',
      socialLinks: { facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '' },
    },
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control, name: 'phone',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contact-info'],
    queryFn: contactInfoService.get,
  });

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      reset({
        companyNameAr: d.companyNameAr || '',
        companyNameEn: d.companyNameEn || '',
        addressAr: d.addressAr || '',
        addressEn: d.addressEn || '',
        phone: d.phone?.length ? d.phone : [''],
        whatsapp: d.whatsapp || '',
        email: d.email || '',
        workingHoursAr: d.workingHoursAr || '',
        workingHoursEn: d.workingHoursEn || '',
        googleMapsUrl: d.googleMapsUrl || '',
        socialLinks: {
          facebook:  d.socialLinks?.facebook  || '',
          instagram: d.socialLinks?.instagram || '',
          linkedin:  d.socialLinks?.linkedin  || '',
          twitter:   d.socialLinks?.twitter   || '',
          youtube:   d.socialLinks?.youtube   || '',
        },
      });
    }
  }, [data, reset]);

  const updateMut = useMutation({
    mutationFn: contactInfoService.update,
    onSuccess: () => {
      toast.success(t('تم الحفظ بنجاح', 'Saved successfully'));
      qc.invalidateQueries({ queryKey: ['contact-info'] });
    },
    onError: () => toast.error(t('حدث خطأ', 'An error occurred')),
  });

  const onSubmit = (values) => {
    // Filter out empty phone entries
    values.phone = values.phone.filter(Boolean);
    updateMut.mutate(values);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-lg" /></div>;
  }

  return (
    <div className="contact-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('معلومات التواصل', 'Contact Information')}</h1>
          <p className="section-subtitle">{t('تعديل بيانات التواصل التي تظهر في الموقع', 'Edit the contact details displayed on the website')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="contact-form-grid">

          {/* Company & Address */}
          <div className="contact-form-section">
            <div className="contact-form-section-title">
              <Globe size={16} /> {t('اسم الشركة والعنوان', 'Company Name & Address')}
            </div>
            <div className="form-group">
              <label>{t('اسم الشركة (عربي)', 'Company Name (Arabic)')}</label>
              <input dir="rtl" className="form-input" {...register('companyNameAr')} />
            </div>
            <div className="form-group">
              <label>{t('اسم الشركة (إنجليزي)', 'Company Name (English)')}</label>
              <input dir="ltr" className="form-input" {...register('companyNameEn')} />
            </div>
            <div className="form-group">
              <label>{t('العنوان (عربي)', 'Address (Arabic)')}</label>
              <textarea dir="rtl" rows={2} className="form-input" {...register('addressAr')} />
            </div>
            <div className="form-group">
              <label>{t('العنوان (إنجليزي)', 'Address (English)')}</label>
              <textarea dir="ltr" rows={2} className="form-input" {...register('addressEn')} />
            </div>
          </div>

          {/* Phone, Email, WhatsApp */}
          <div className="contact-form-section">
            <div className="contact-form-section-title">
              <Phone size={16} /> {t('بيانات الاتصال', 'Contact Details')}
            </div>

            <div className="form-group">
              <label className="flex-between">
                {t('أرقام الهاتف', 'Phone Numbers')}
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => appendPhone('')}>
                  <Plus size={14} /> {t('إضافة رقم', 'Add Number')}
                </button>
              </label>
              <div className="phone-list">
                {phoneFields.map((field, idx) => (
                  <div key={field.id} className="phone-row">
                    <input type="tel" dir="ltr" className="form-input" {...register(`phone.${idx}`)} placeholder="+966..." />
                    {phoneFields.length > 1 && (
                      <button type="button" className="btn btn-icon btn-danger" onClick={() => removePhone(idx)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><MessageSquare size={14} style={{display:'inline',marginBottom:-2,marginLeft:4}} /> {t('رقم واتساب', 'WhatsApp Number')}</label>
              <input type="tel" dir="ltr" className="form-input" {...register('whatsapp')} placeholder="+966..." />
            </div>

            <div className="form-group">
              <label><Mail size={14} style={{display:'inline',marginBottom:-2,marginLeft:4}} /> {t('البريد الإلكتروني', 'Email Address')}</label>
              <input type="email" dir="ltr" className="form-input" {...register('email')} />
            </div>

            <div className="form-group">
              <label><Clock size={14} style={{display:'inline',marginBottom:-2,marginLeft:4}} /> {t('أوقات العمل (عربي)', 'Working Hours (Arabic)')}</label>
              <input dir="rtl" className="form-input" {...register('workingHoursAr')} placeholder="السبت - الخميس: 9ص - 5م" />
            </div>
            <div className="form-group">
              <label><Clock size={14} style={{display:'inline',marginBottom:-2,marginLeft:4}} /> {t('أوقات العمل (إنجليزي)', 'Working Hours (English)')}</label>
              <input dir="ltr" className="form-input" {...register('workingHoursEn')} placeholder="Sat - Thu: 9AM - 5PM" />
            </div>
          </div>

          {/* Google Maps */}
          <div className="contact-form-section">
            <div className="contact-form-section-title">
              <MapPin size={16} /> {t('الموقع على الخريطة', 'Google Maps Location')}
            </div>
            <div className="form-group">
              <label>{t('رابط Google Maps أو Embed URL', 'Google Maps Embed URL')}</label>
              <input dir="ltr" className="form-input" {...register('googleMapsUrl')} placeholder="https://maps.google.com/maps?q=..." />
              <span className="form-hint">{t('احصل على رابط التضمين من Google Maps', 'Get the embed URL from Google Maps > Share > Embed a map')}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="contact-form-section">
            <div className="contact-form-section-title">
              <Globe size={16} /> {t('روابط التواصل الاجتماعي', 'Social Media Links')}
            </div>
            <div className="social-links-grid">
              {[
                { key: 'facebook',  Icon: Facebook,  label: 'Facebook' },
                { key: 'instagram', Icon: Instagram, label: 'Instagram' },
                { key: 'linkedin',  Icon: Linkedin,  label: 'LinkedIn' },
                { key: 'twitter',   Icon: Twitter,   label: 'Twitter / X' },
                { key: 'youtube',   Icon: Youtube,   label: 'YouTube' },
              ].map(({ key, Icon, label }) => (
                <div key={key} className="form-group">
                  <label><Icon size={13} style={{ display: 'inline', marginBottom: -2 }} /> {label}</label>
                  <input type="url" dir="ltr" className="form-input" {...register(`socialLinks.${key}`)} placeholder="https://..." />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="contact-save-bar">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMut.isPending}>
            {updateMut.isPending ? <span className="spinner" /> : null}
            {t('حفظ التغييرات', 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactPage;
