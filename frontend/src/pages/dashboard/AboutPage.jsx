import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, Trash2, Save, Info, RefreshCw, Eye } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

import aboutService from '../../services/about.service';
import './AboutPage.css';

const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        >
          Center
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        >
          Right
        </button>
      </div>
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
};

const AboutPage = () => {
  const { lang } = useOutletContext();
  const queryClient = useQueryClient();
  const t = (ar, en) => (lang === 'ar' ? ar : en);
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['about'],
    queryFn: aboutService.getAbout,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      arabicTitle: '',
      companyName: '',
      englishName: '',
      description: '',
      arabicDescription: '',
    },
  });

  useEffect(() => {
    if (data?.data) {
      reset({
        arabicTitle:        data.data.arabicTitle        || '',
        companyName:        data.data.companyName        || '',
        englishName:        data.data.englishName        || '',
        description:        data.data.description        || '',
        arabicDescription:  data.data.arabicDescription  || '',
      });
      if (data.data.image) {
        // Prepend backend URL in production, or localhost in dev
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        setImagePreview(`${baseUrl}${data.data.image}`);
      }
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: aboutService.updateAbout,
    onSuccess: () => {
      toast.success(t('تم الحفظ بنجاح', 'Saved successfully'));
      queryClient.invalidateQueries(['about']);
    },
    onError: () => {
      toast.error(t('حدث خطأ أثناء الحفظ', 'Error saving changes'));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: aboutService.uploadImage,
    onSuccess: (res) => {
      toast.success(t('تم رفع الصورة بنجاح', 'Image uploaded successfully'));
      setSelectedFile(null);
      queryClient.invalidateQueries(['about']);
    },
    onError: () => {
      toast.error(t('حدث خطأ أثناء الرفع', 'Error uploading image'));
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: aboutService.deleteImage,
    onSuccess: () => {
      toast.success(t('تم حذف الصورة بنجاح', 'Image deleted successfully'));
      setImagePreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries(['about']);
    },
    onError: () => {
      toast.error(t('حدث خطأ أثناء الحذف', 'Error deleting image'));
    },
  });

  const onSubmit = (formData) => {
    updateMutation.mutate(formData);
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'Image size must not exceed 5MB'));
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    if (selectedFile) {
      // Just clear selection if it's not saved yet
      setSelectedFile(null);
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      setImagePreview(data?.data?.image ? `${baseUrl}${data.data.image}` : null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (data?.data?.image) {
      // Delete from backend
      if (window.confirm(t('هل أنت متأكد من حذف الصورة؟', 'Are you sure you want to delete this image?'))) {
        deleteImageMutation.mutate();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="about-page">
        <div className="section-header skeleton" style={{ height: 60, width: '40%' }} />
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 40, width: '100%' }} />
          <div className="skeleton" style={{ height: 40, width: '100%' }} />
          <div className="skeleton" style={{ height: 150, width: '100%' }} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="about-page">
        <div className="error-state">
          {t('تعذر تحميل البيانات. يرجى المحاولة لاحقاً.', 'Failed to load data. Please try again later.')}
        </div>
      </div>
    );
  }

  return (
    <div className="about-page page-enter">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Info size={24} className="text-accent" />
            {t('من نحن', 'About Us')}
          </h1>
          <p className="section-subtitle">
            {t('قم بإدارة المحتوى الخاص بقسم "من نحن" في الصفحة الرئيسية', 'Manage the content for the About Us section on the landing page')}
          </p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending || uploadMutation.isPending || (!isDirty && !selectedFile)}
          >
            {updateMutation.isPending || uploadMutation.isPending ? (
              <RefreshCw size={18} className="spin" />
            ) : (
              <Save size={18} />
            )}
            {t('حفظ التغييرات', 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="about-content-grid">
        <form className="about-form card" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">{t('العنوان باللغة العربية', 'Arabic Title')}</label>
            <input
              type="text"
              className={`form-control ${errors.arabicTitle ? 'is-invalid' : ''}`}
              placeholder="الاسم الرسمي لأنظمة التهوية المركزية"
              {...register('arabicTitle', { required: true, maxLength: 100 })}
            />
            {errors.arabicTitle && <span className="error-text">{t('هذا الحقل مطلوب', 'This field is required')}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('اسم الشركة', 'Company Name')}</label>
            <input
              type="text"
              className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
              placeholder="S.M.G Turbo Fan"
              {...register('companyName', { required: true, maxLength: 100 })}
            />
            {errors.companyName && <span className="error-text">{t('هذا الحقل مطلوب', 'This field is required')}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('الاسم باللغة الإنجليزية', 'English Name')}</label>
            <input
              type="text"
              className={`form-control ${errors.englishName ? 'is-invalid' : ''}`}
              placeholder="S.M.G. Turbo Fan Central Ventilation Systems"
              dir="ltr"
              {...register('englishName', { required: true, maxLength: 150 })}
            />
            {errors.englishName && <span className="error-text">{t('هذا الحقل مطلوب', 'This field is required')}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('الوصف باللغة الإنجليزية', 'English Description')}</label>
            <Controller
              name="description"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div className={`editor-container ${errors.description ? 'is-invalid' : ''}`}>
                  <TiptapEditor value={field.value} onChange={field.onChange} />
                </div>
              )}
            />
            {errors.description && <span className="error-text">{t('هذا الحقل مطلوب', 'This field is required')}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('الوصف باللغة العربية', 'Arabic Description')}</label>
            <Controller
              name="arabicDescription"
              control={control}
              render={({ field }) => (
                <div className="editor-container">
                  <TiptapEditor value={field.value} onChange={field.onChange} />
                </div>
              )}
            />
          </div>
        </form>

        <div className="about-sidebar">
          <div className="card image-card">
            <h3 className="card-title">{t('صورة الشركة', 'Company Image')}</h3>
            <p className="card-desc text-muted mb-4">
              {t('تنسيقات: JPG, PNG, WEBP. الحجم الأقصى: 5 ميجابايت', 'Formats: JPG, PNG, WEBP. Max size: 5MB')}
            </p>

            <div className="image-uploader">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Company" className="image-preview" />
                  <div className="image-actions">
                    <button 
                      type="button" 
                      className="btn btn-icon btn-secondary" 
                      onClick={() => fileInputRef.current?.click()}
                      title={t('استبدال', 'Replace')}
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-icon btn-danger" 
                      onClick={handleDeleteImage}
                      title={t('حذف', 'Delete')}
                      disabled={deleteImageMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="image-upload-prompt" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={40} className="text-muted mb-2" />
                  <p>{t('انقر لرفع صورة', 'Click to upload image')}</p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                ref={fileInputRef}
                className="hidden-file-input"
                onChange={handleImageChange}
              />
            </div>
            
            {selectedFile && (
              <div className="mt-3 text-sm text-warning text-center">
                {t('لم يتم حفظ الصورة بعد', 'Image not saved yet')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
