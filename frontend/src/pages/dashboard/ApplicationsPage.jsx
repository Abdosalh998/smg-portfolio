import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff,
  ImagePlus, X, Grid3X3,
} from 'lucide-react';

import { ICON_LIST, getIconComp } from '../../constants/whyChooseUsIcons';
import applicationService from '../../services/application.service';
import './ApplicationsPage.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const IconPicker = ({ value, onChange }) => (
  <div className="icon-picker">
    {ICON_LIST.map(({ name, Comp }) => (
      <button
        key={name}
        type="button"
        className={`icon-picker-btn${value === name ? ' selected' : ''}`}
        onClick={() => onChange(name)}
        title={name}
      >
        <Comp size={20} />
      </button>
    ))}
  </div>
);

const SortableRow = ({ item, lang, onEdit, onDelete, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const IconComp = getIconComp(item.icon);
  const name = lang === 'ar' ? item.nameAr : item.nameEn;
  const imgSrc = item.image ? `${BASE_URL}${item.image}` : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`app-row${!item.isActive ? ' app-row--inactive' : ''}`}
    >
      <button className="app-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={18} />
      </button>

      <div className="app-row-icon">
        {imgSrc
          ? <img src={imgSrc} alt={name} className="app-row-img" />
          : <IconComp size={22} />}
      </div>

      <div className="app-row-info">
        <span className="app-row-title">{name}</span>
        {!item.isActive && (
          <span className="badge badge-warning" style={{ fontSize: 10 }}>Hidden</span>
        )}
      </div>

      <div className="app-row-actions">
        <button
          type="button"
          className={`btn btn-icon ${item.isActive ? 'btn-ghost' : 'btn-secondary'}`}
          onClick={() => onToggle(item._id)}
          title={item.isActive ? 'Hide' : 'Show'}
        >
          {item.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button
          type="button"
          className="btn btn-icon btn-ghost"
          onClick={() => onEdit(item)}
          title="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          className="btn btn-icon btn-danger"
          onClick={() => onDelete(item)}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

const ApplicationsPage = () => {
  const { lang } = useOutletContext();
  const qc = useQueryClient();
  const t = (ar, en) => lang === 'ar' ? ar : en;

  const [modalItem, setModalItem]     = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [imgPreview, setImgPreview]   = useState(null);
  const [imgFile, setImgFile]         = useState(null);
  const fileRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm({ defaultValues: { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', icon: 'Building', isActive: true } });

  const selectedIcon = watch('icon');

  const { data, isLoading } = useQuery({
    queryKey: ['applications-admin'],
    queryFn: () => applicationService.getAll(true),
  });
  const items = data?.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['applications-admin'] });
    qc.invalidateQueries({ queryKey: ['applications-public'] });
  };

  const createMut = useMutation({
    mutationFn: applicationService.create,
    onSuccess: () => { toast.success(t('تم الإضافة', 'Added')); invalidate(); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => applicationService.update(id, payload),
    onSuccess: () => { toast.success(t('تم التحديث', 'Updated')); invalidate(); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const deleteMut = useMutation({
    mutationFn: applicationService.delete,
    onSuccess: () => { toast.success(t('تم الحذف', 'Deleted')); invalidate(); setItemToDelete(null); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const toggleMut = useMutation({
    mutationFn: applicationService.toggleStatus,
    onSuccess: () => { toast.success(t('تم التغيير', 'Status updated')); invalidate(); },
    onError: () => toast.error(t('حدث خطأ', 'Error')),
  });

  const reorderMut = useMutation({
    mutationFn: applicationService.reorder,
    onError: () => toast.error(t('فشل حفظ الترتيب', 'Failed to save order')),
  });

  const uploadImgMut = useMutation({
    mutationFn: ({ id, file }) => applicationService.uploadImage(id, file),
    onSuccess: () => { toast.success(t('تم رفع الصورة', 'Image uploaded')); invalidate(); },
    onError: () => toast.error(t('فشل رفع الصورة', 'Image upload failed')),
  });

  const deleteImgMut = useMutation({
    mutationFn: (id) => applicationService.deleteImage(id),
    onSuccess: () => { toast.success(t('تم حذف الصورة', 'Image deleted')); invalidate(); },
    onError: () => toast.error(t('حدث خطأ', 'Error')),
  });

  const openNew = () => {
    reset({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', icon: 'Building', isActive: true });
    setImgPreview(null);
    setImgFile(null);
    setModalItem({});
  };

  const openEdit = (item) => {
    reset({
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      descriptionAr: item.descriptionAr || '',
      descriptionEn: item.descriptionEn || '',
      icon: item.icon || 'Building',
      isActive: item.isActive,
    });
    setImgPreview(item.image ? `${BASE_URL}${item.image}` : null);
    setImgFile(null);
    setModalItem(item);
  };

  const closeModal = () => { setModalItem(null); setImgPreview(null); setImgFile(null); };

  const onSubmit = async (values) => {
    if (modalItem?._id) {
      await updateMut.mutateAsync({ id: modalItem._id, payload: values });
      if (imgFile) await uploadImgMut.mutateAsync({ id: modalItem._id, file: imgFile });
    } else {
      const res = await createMut.mutateAsync(values);
      if (imgFile && res.data?._id) {
        await uploadImgMut.mutateAsync({ id: res.data._id, file: imgFile });
      }
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i._id === active.id);
    const newIdx = items.findIndex(i => i._id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);

    qc.setQueryData(['applications-admin'], (old) => ({
      ...old,
      data: reordered,
    }));

    reorderMut.mutate(reordered.map((item, idx) => ({ id: item._id, order: idx + 1 })));
  };

  return (
    <div className="applications-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('التطبيقات', 'Applications')}</h1>
          <p className="section-subtitle">
            {t('إدارة مجالات تطبيق أنظمة التهوية', 'Manage application areas for ventilation systems')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} />
          {t('إضافة تطبيق', 'Add Application')}
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="app-empty">
            <Grid3X3 size={48} />
            <p>{t('لا توجد تطبيقات بعد', 'No applications yet')}</p>
            <button className="btn btn-primary" onClick={openNew}>{t('أضف أول تطبيق', 'Add First Application')}</button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
              <div className="app-list">
                {items.map((item) => (
                  <SortableRow
                    key={item._id}
                    item={item}
                    lang={lang}
                    onEdit={openEdit}
                    onDelete={setItemToDelete}
                    onToggle={(id) => toggleMut.mutate(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {modalItem !== null && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal app-modal" onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <h2 className="app-modal-title">
                {modalItem._id ? t('تعديل التطبيق', 'Edit Application') : t('إضافة تطبيق جديد', 'Add New Application')}
              </h2>
              <button className="btn btn-icon btn-ghost" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="app-modal-form" noValidate>
              <div className="form-group">
                <label className="form-label">{t('اسم التطبيق (عربي)', 'Application Name (Arabic)')} *</label>
                <input
                  className={`form-input${errors.nameAr ? ' error' : ''}`}
                  dir="rtl"
                  {...register('nameAr', { required: t('مطلوب', 'Required') })}
                />
                {errors.nameAr && <span className="form-error">{errors.nameAr.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('اسم التطبيق (إنجليزي)', 'Application Name (English)')} *</label>
                <input
                  className={`form-input${errors.nameEn ? ' error' : ''}`}
                  dir="ltr"
                  {...register('nameEn', { required: t('مطلوب', 'Required') })}
                />
                {errors.nameEn && <span className="form-error">{errors.nameEn.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('وصف قصير (عربي)', 'Short Description (Arabic)')}</label>
                <textarea className="form-input" rows={2} dir="rtl" {...register('descriptionAr')} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('وصف قصير (إنجليزي)', 'Short Description (English)')}</label>
                <textarea className="form-input" rows={2} dir="ltr" {...register('descriptionEn')} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('الأيقونة', 'Icon')}</label>
                <IconPicker value={selectedIcon} onChange={(name) => setValue('icon', name)} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('صورة التطبيق (اختياري)', 'Application Image (Optional)')}</label>
                <div className="app-img-upload">
                  {imgPreview ? (
                    <div className="app-img-preview">
                      <img src={imgPreview} alt="preview" />
                      <button
                        type="button"
                        className="app-img-remove"
                        onClick={() => {
                          setImgPreview(null);
                          setImgFile(null);
                          if (modalItem?._id && modalItem.image) deleteImgMut.mutate(modalItem._id);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="app-img-btn"
                      onClick={() => fileRef.current?.click()}
                    >
                      <ImagePlus size={20} />
                      <span>{t('رفع صورة', 'Upload Image')}</span>
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setImgFile(f);
                      setImgPreview(URL.createObjectURL(f));
                    }}
                  />
                </div>
                <p className="form-hint">{t('سيتم عرض الأيقونة بدلاً من الصورة في حالة عدم رفعها', 'Icon will be used if no image is uploaded')}</p>
              </div>

              <div className="form-group app-toggle-row">
                <label className="form-label">{t('تفعيل التطبيق', 'Active Application')}</label>
                <label className="toggle-switch">
                  <input type="checkbox" {...register('isActive')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="app-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t('إلغاء', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? <><span className="spinner" />{t('جاري الحفظ...', 'Saving...')}</>
                    : <>{t('حفظ التطبيق', 'Save Application')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {t('تأكيد الحذف', 'Confirm Delete')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {t(
                `هل أنت متأكد من حذف "${lang === 'ar' ? itemToDelete.nameAr : itemToDelete.nameEn}"؟ لا يمكن التراجع.`,
                `Are you sure you want to delete "${lang === 'ar' ? itemToDelete.nameAr : itemToDelete.nameEn}"? This cannot be undone.`
              )}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setItemToDelete(null)}>{t('إلغاء', 'Cancel')}</button>
              <button
                className="btn btn-danger"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(itemToDelete._id)}
              >
                {deleteMut.isPending ? <span className="spinner" /> : null}
                {t('حذف', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
