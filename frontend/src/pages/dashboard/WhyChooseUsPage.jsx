import { useState } from 'react';
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
  Star, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff,
} from 'lucide-react';

import { ICON_LIST, getIconComp } from '../../constants/whyChooseUsIcons';

import service from '../../services/whyChooseUs.service';
import './WhyChooseUsPage.css';

// ── Icon Picker ────────────────────────────────────────────────────────────────
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

// ── Sortable Row ───────────────────────────────────────────────────────────────
const SortableRow = ({ item, lang, onEdit, onDelete, onToggle, isDeleting }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComp = getIconComp(item.icon);
  const title    = lang === 'ar' ? item.titleAr : item.titleEn;

  return (
    <div ref={setNodeRef} style={style} className={`wcu-row${!item.isActive ? ' wcu-row--inactive' : ''}`}>
      <button className="wcu-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={18} />
      </button>

      <div className="wcu-row-icon">
        <IconComp size={22} />
      </div>

      <div className="wcu-row-info">
        <span className="wcu-row-title">{title}</span>
        {!item.isActive && <span className="badge badge-warning" style={{ fontSize: 10 }}>Hidden</span>}
      </div>

      <div className="wcu-row-actions">
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
          onClick={() => onDelete(item._id)}
          disabled={isDeleting}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ── Modal Form ─────────────────────────────────────────────────────────────────
const ItemModal = ({ item, lang, onClose, onSaved }) => {
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const isEdit = Boolean(item?._id);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      titleAr:       item?.titleAr       || '',
      titleEn:       item?.titleEn       || '',
      descriptionAr: item?.descriptionAr || '',
      descriptionEn: item?.descriptionEn || '',
      icon:          item?.icon          || 'Star',
    },
  });

  const selectedIcon = watch('icon');

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? service.updateItem(item._id, data) : service.createItem(data),
    onSuccess: () => {
      toast.success(isEdit
        ? t('تم التحديث بنجاح', 'Updated successfully')
        : t('تم الإضافة بنجاح', 'Added successfully'));
      onSaved();
    },
    onError: () => toast.error(t('حدث خطأ', 'An error occurred')),
  });

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal wcu-modal">
        <div className="wcu-modal-header">
          <h2 className="section-title" style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
            {isEdit ? t('تعديل العنصر', 'Edit Item') : t('إضافة عنصر جديد', 'Add New Item')}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="wcu-modal-form">
          {/* Titles */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">{t('العنوان (عربي)', 'Title (Arabic)')}</label>
              <input
                className={`form-control${errors.titleAr ? ' is-invalid' : ''}`}
                placeholder="جودة التصنيع"
                {...register('titleAr', { required: true, maxLength: 100 })}
              />
              {errors.titleAr && <span className="error-text">{t('مطلوب', 'Required')}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('العنوان (إنجليزي)', 'Title (English)')}</label>
              <input
                className={`form-control${errors.titleEn ? ' is-invalid' : ''}`}
                placeholder="Manufacturing Quality"
                dir="ltr"
                {...register('titleEn', { required: true, maxLength: 100 })}
              />
              {errors.titleEn && <span className="error-text">{t('مطلوب', 'Required')}</span>}
            </div>
          </div>

          {/* Descriptions */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">{t('الوصف (عربي)', 'Description (Arabic)')}</label>
              <textarea className="form-control" rows={3} placeholder="وصف اختياري بالعربية..."
                {...register('descriptionAr')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('الوصف (إنجليزي)', 'Description (English)')}</label>
              <textarea className="form-control" rows={3} placeholder="Optional English description..." dir="ltr"
                {...register('descriptionEn')} />
            </div>
          </div>

          {/* Icon Picker */}
          <div className="form-group">
            <label className="form-label">{t('الأيقونة', 'Icon')}</label>
            <IconPicker value={selectedIcon} onChange={(v) => setValue('icon', v)} />
            {errors.icon && <span className="error-text">{t('مطلوب', 'Required')}</span>}
          </div>

          <div className="wcu-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('إلغاء', 'Cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending
                ? t('جاري الحفظ...', 'Saving...')
                : isEdit ? t('حفظ التغييرات', 'Save Changes') : t('إضافة', 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const WhyChooseUsPage = () => {
  const { lang } = useOutletContext();
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const queryClient = useQueryClient();

  const [modalItem, setModalItem] = useState(null);   // null = closed, {} = new, item = edit
  const [itemToDelete, setItemToDelete] = useState(null); // null = no delete, id = confirm delete
  const [items, setItems]         = useState([]);      // local state for drag-and-drop

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { isLoading } = useQuery({
    queryKey: ['why-choose-us-admin'],
    queryFn:  service.getAllAdmin,
    onSuccess: (data) => setItems(data.data),
  });

  // Keep local items in sync with server
  const { data: serverData } = useQuery({
    queryKey: ['why-choose-us-admin'],
    queryFn:  service.getAllAdmin,
    select:   (d) => d.data,
  });

  if (serverData && items.length !== serverData.length) setItems(serverData);

  const deleteMutation = useMutation({
    mutationFn: service.deleteItem,
    onSuccess: () => {
      toast.success(t('تم الحذف', 'Deleted'));
      setItemToDelete(null);
      queryClient.invalidateQueries(['why-choose-us-admin']);
      queryClient.invalidateQueries(['why-choose-us']);
    },
    onError: () => toast.error(t('فشل الحذف', 'Delete failed')),
  });

  const toggleMutation = useMutation({
    mutationFn: service.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['why-choose-us-admin']);
      queryClient.invalidateQueries(['why-choose-us']);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: service.reorderItems,
    onSuccess: () => {
      queryClient.invalidateQueries(['why-choose-us-admin']);
      queryClient.invalidateQueries(['why-choose-us']);
    },
  });

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i._id === active.id);
    const newIndex = items.findIndex(i => i._id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex);

    setItems(newOrder);
    reorderMutation.mutate(newOrder.map((item, idx) => ({ id: item._id, order: idx + 1 })));
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
  };

  const onModalSaved = () => {
    setModalItem(null);
    queryClient.invalidateQueries(['why-choose-us-admin']);
    queryClient.invalidateQueries(['why-choose-us']);
  };

  const displayItems = serverData || items;

  return (
    <div className="wcu-page page-enter">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Star size={22} className="text-accent" />
            {t('لماذا تختارنا', 'Why Choose Us')}
          </h1>
          <p className="section-subtitle">
            {t(
              'أضف وعدّل نقاط المزايا التنافسية. اسحب للترتيب.',
              'Add and edit competitive advantage points. Drag to reorder.'
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalItem({})}>
          <Plus size={18} />
          {t('إضافة ميزة', 'Add Feature')}
        </button>
      </div>

      {/* ── List ── */}
      <div className="card wcu-list-card">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
          ))
        ) : displayItems.length === 0 ? (
          <div className="home-empty-state">
            <Star size={48} style={{ color: 'var(--border-accent)' }} />
            <p>{t('لا توجد عناصر بعد. أضف أول ميزة!', 'No items yet. Add the first feature!')}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
              {displayItems.map(item => (
                <SortableRow
                  key={item._id}
                  item={item}
                  lang={lang}
                  onEdit={(i) => setModalItem(i)}
                  onDelete={handleDelete}
                  onToggle={(id) => toggleMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ── Modal ── */}
      {modalItem !== null && (
        <ItemModal
          item={modalItem._id ? modalItem : null}
          lang={lang}
          onClose={() => setModalItem(null)}
          onSaved={onModalSaved}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {itemToDelete && (
        <div className="overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center', padding: 'var(--space-6)' }}>
            <Trash2 size={48} className="text-danger" style={{ margin: '0 auto var(--space-4)' }} />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>{t('تأكيد الحذف', 'Confirm Deletion')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              {t('هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.', 'Are you sure you want to delete this item? This action cannot be undone.')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setItemToDelete(null)}>
                {t('إلغاء', 'Cancel')}
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => deleteMutation.mutate(itemToDelete)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('جاري الحذف...', 'Deleting...') : t('حذف', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhyChooseUsPage;

