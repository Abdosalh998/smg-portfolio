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
  ImagePlus, X, Wrench,
} from 'lucide-react';

import { ICON_LIST, getIconComp } from '../../constants/whyChooseUsIcons';
import serviceService from '../../services/service.service';
import './ServicesPage.css';

import BASE_URL from '../../utils/baseUrl';

// ── Icon Picker ──────────────────────────────────────────────────────────────
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

// ── Sortable Row ─────────────────────────────────────────────────────────────
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
      className={`svc-row${!item.isActive ? ' svc-row--inactive' : ''}`}
    >
      <button className="svc-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={18} />
      </button>

      <div className="svc-row-icon">
        {imgSrc
          ? <img src={imgSrc} alt={name} className="svc-row-img" />
          : <IconComp size={22} />}
      </div>

      <div className="svc-row-info">
        <span className="svc-row-title">{name}</span>
        {!item.isActive && (
          <span className="badge badge-warning" style={{ fontSize: 10 }}>Hidden</span>
        )}
      </div>

      <div className="svc-row-actions">
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

// ── Main Page ────────────────────────────────────────────────────────────────
const ServicesPage = () => {
  const { lang } = useOutletContext();
  const qc = useQueryClient();
  const t = (ar, en) => lang === 'ar' ? ar : en;

  // modal state
  const [modalItem, setModalItem]     = useState(null); // null=closed, {}=new, item=edit
  const [itemToDelete, setItemToDelete] = useState(null);

  // image preview state (for modal)
  const [imgPreview, setImgPreview]   = useState(null);
  const [imgFile, setImgFile]         = useState(null);
  const fileRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm({ defaultValues: { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', icon: 'Wrench', isActive: true } });

  const selectedIcon = watch('icon');

  // ─ Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['services-admin'],
    queryFn: () => serviceService.getAll(true),
  });
  const items = data?.data ?? [];

  // ─ Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['services-admin'] });
    qc.invalidateQueries({ queryKey: ['services-public'] });
  };

  const createMut = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => { toast.success(t('تم الإضافة', 'Added')); invalidate(); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => serviceService.update(id, payload),
    onSuccess: () => { toast.success(t('تم التحديث', 'Updated')); invalidate(); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const deleteMut = useMutation({
    mutationFn: serviceService.delete,
    onSuccess: () => { toast.success(t('تم الحذف', 'Deleted')); invalidate(); setItemToDelete(null); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const toggleMut = useMutation({
    mutationFn: serviceService.toggleStatus,
    onSuccess: () => { toast.success(t('تم التغيير', 'Status updated')); invalidate(); },
    onError: () => toast.error(t('حدث خطأ', 'Error')),
  });

  const reorderMut = useMutation({
    mutationFn: serviceService.reorder,
    onError: () => toast.error(t('فشل حفظ الترتيب', 'Failed to save order')),
  });

  const uploadImgMut = useMutation({
    mutationFn: ({ id, file }) => serviceService.uploadImage(id, file),
    onSuccess: () => { toast.success(t('تم رفع الصورة', 'Image uploaded')); invalidate(); },
    onError: () => toast.error(t('فشل رفع الصورة', 'Image upload failed')),
  });

  const deleteImgMut = useMutation({
    mutationFn: (id) => serviceService.deleteImage(id),
    onSuccess: () => { toast.success(t('تم حذف الصورة', 'Image deleted')); invalidate(); },
    onError: () => toast.error(t('حدث خطأ', 'Error')),
  });

  // ─ Modal helpers ──────────────────────────────────────────────────────────
  const openNew = () => {
    reset({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', icon: 'Wrench', isActive: true });
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
      icon: item.icon || 'Wrench',
      isActive: item.isActive,
    });
    setImgPreview(item.image ? `${BASE_URL}${item.image}` : null);
    setImgFile(null);
    setModalItem(item);
  };

  const closeModal = () => { setModalItem(null); setImgPreview(null); setImgFile(null); };

  // ─ Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values) => {
    if (modalItem?._id) {
      // Edit existing
      await updateMut.mutateAsync({ id: modalItem._id, payload: values });
      // Upload image if chosen
      if (imgFile) await uploadImgMut.mutateAsync({ id: modalItem._id, file: imgFile });
    } else {
      // Create new
      const res = await createMut.mutateAsync(values);
      if (imgFile && res.data?._id) {
        await uploadImgMut.mutateAsync({ id: res.data._id, file: imgFile });
      }
    }
  };

  // ─ Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i._id === active.id);
    const newIdx = items.findIndex(i => i._id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);

    qc.setQueryData(['services-admin'], (old) => ({
      ...old,
      data: reordered,
    }));

    reorderMut.mutate(reordered.map((item, idx) => ({ id: item._id, order: idx + 1 })));
  };

  return (
    <div className="services-page">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('الخدمات', 'Services')}</h1>
          <p className="section-subtitle">
            {t('إدارة خدمات الشركة وترتيبها', 'Manage and reorder company services')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew} id="add-service-btn">
          <Plus size={16} />
          {t('إضافة خدمة', 'Add Service')}
        </button>
      </div>

      {/* ── List ── */}
      <div className="card">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="svc-empty">
            <Wrench size={48} />
            <p>{t('لا توجد خدمات بعد', 'No services yet')}</p>
            <button className="btn btn-primary" onClick={openNew}>{t('أضف أول خدمة', 'Add First Service')}</button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
              <div className="svc-list">
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

      {/* ── Edit/Create Modal ── */}
      {modalItem !== null && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal svc-modal" onClick={e => e.stopPropagation()}>
            <div className="svc-modal-header">
              <h2 className="svc-modal-title">
                {modalItem._id ? t('تعديل الخدمة', 'Edit Service') : t('إضافة خدمة جديدة', 'Add New Service')}
              </h2>
              <button className="btn btn-icon btn-ghost" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="svc-modal-form" noValidate>
              {/* Name AR */}
              <div className="form-group">
                <label className="form-label">{t('اسم الخدمة (عربي)', 'Service Name (Arabic)')} *</label>
                <input
                  className={`form-input${errors.nameAr ? ' error' : ''}`}
                  dir="rtl"
                  {...register('nameAr', { required: t('مطلوب', 'Required') })}
                />
                {errors.nameAr && <span className="form-error">{errors.nameAr.message}</span>}
              </div>

              {/* Name EN */}
              <div className="form-group">
                <label className="form-label">{t('اسم الخدمة (إنجليزي)', 'Service Name (English)')} *</label>
                <input
                  className={`form-input${errors.nameEn ? ' error' : ''}`}
                  dir="ltr"
                  {...register('nameEn', { required: t('مطلوب', 'Required') })}
                />
                {errors.nameEn && <span className="form-error">{errors.nameEn.message}</span>}
              </div>

              {/* Description AR */}
              <div className="form-group">
                <label className="form-label">{t('وصف الخدمة (عربي)', 'Description (Arabic)')}</label>
                <textarea className="form-input" rows={3} dir="rtl" {...register('descriptionAr')} />
              </div>

              {/* Description EN */}
              <div className="form-group">
                <label className="form-label">{t('وصف الخدمة (إنجليزي)', 'Description (English)')}</label>
                <textarea className="form-input" rows={3} dir="ltr" {...register('descriptionEn')} />
              </div>

              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">{t('الأيقونة', 'Icon')}</label>
                <IconPicker value={selectedIcon} onChange={(name) => setValue('icon', name)} />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">{t('صورة الخدمة (اختياري)', 'Service Image (Optional)')}</label>
                <div className="svc-img-upload">
                  {imgPreview ? (
                    <div className="svc-img-preview">
                      <img src={imgPreview} alt="preview" />
                      <button
                        type="button"
                        className="svc-img-remove"
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
                      className="svc-img-btn"
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
                <p className="form-hint">{t('اترك فارغاً لاستخدام الأيقونة', 'Leave empty to use icon instead')}</p>
              </div>

              {/* Active */}
              <div className="form-group svc-toggle-row">
                <label className="form-label">{t('تفعيل الخدمة', 'Active Service')}</label>
                <label className="toggle-switch">
                  <input type="checkbox" {...register('isActive')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="svc-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t('إلغاء', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? <><span className="spinner" />{t('جاري الحفظ...', 'Saving...')}</>
                    : <>{t('حفظ الخدمة', 'Save Service')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
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

export default ServicesPage;
