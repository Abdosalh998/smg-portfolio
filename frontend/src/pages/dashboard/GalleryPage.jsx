import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  UploadCloud, Pencil, Trash2, GripVertical, Eye, EyeOff,
  Search, X, Image as ImageIcon, ImagePlus
} from 'lucide-react';

import galleryService from '../../services/gallery.service';
import BASE_URL from '../../utils/baseUrl';
import './GalleryPage.css';

const SortableGalleryItem = ({ item, lang, onEdit, onDelete, onToggle, onReplaceImage }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const title = lang === 'ar' ? item.titleAr : item.titleEn;
  const location = lang === 'ar' ? item.locationAr : item.locationEn;
  const imgSrc = item.thumbnail ? `${BASE_URL}${item.thumbnail}` : null;

  return (
    <div ref={setNodeRef} style={style} className={`gallery-item ${!item.isActive ? 'inactive' : ''}`}>
      <div className="gallery-item-img-container">
        {imgSrc ? <img src={imgSrc} alt="Gallery" className="gallery-item-img" loading="lazy" /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#eee'}}><ImageIcon size={48} color="#ccc"/></div>}
        
        <div className="gallery-item-overlay">
          <div className="gallery-drag-handle" {...attributes} {...listeners}>
            <GripVertical size={16} />
          </div>
          
          <div className="gallery-item-actions">
            <button type="button" title={item.isActive ? 'Hide' : 'Show'} onClick={() => onToggle(item._id)}>
              {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button type="button" title="Replace Image" onClick={() => onReplaceImage(item)}>
              <ImageIcon size={16} />
            </button>
            <button type="button" title="Edit Info" onClick={() => onEdit(item)}>
              <Pencil size={16} />
            </button>
            <button type="button" className="btn-danger" title="Delete" onClick={() => onDelete(item)}>
              <Trash2 size={16} />
            </button>
          </div>

          <div className="gallery-item-info">
            {title && <div className="gallery-item-title">{title}</div>}
            {location && <div style={{fontSize: 11, opacity: 0.8}}>{location}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const GalleryPage = () => {
  const { lang } = useOutletContext();
  const qc = useQueryClient();
  const t = (ar, en) => lang === 'ar' ? ar : en;

  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState(null); // for editing info
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToReplace, setItemToReplace] = useState(null); // for replacing image
  const [replaceFile, setReplaceFile] = useState(null);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['gallery-admin'],
    queryFn: () => galleryService.getAll(true),
  });
  const items = data?.data ?? [];

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const lowerSearch = search.toLowerCase();
    return items.filter(item => 
      (item.titleAr && item.titleAr.toLowerCase().includes(lowerSearch)) || 
      (item.titleEn && item.titleEn.toLowerCase().includes(lowerSearch)) ||
      (item.locationAr && item.locationAr.toLowerCase().includes(lowerSearch)) ||
      (item.locationEn && item.locationEn.toLowerCase().includes(lowerSearch))
    );
  }, [items, search]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['gallery-admin'] });

  const createMut = useMutation({
    mutationFn: galleryService.createItems,
    onSuccess: () => { toast.success(t('تم رفع الصور بنجاح', 'Images uploaded successfully')); invalidate(); },
    onError: () => toast.error(t('حدث خطأ', 'Error uploading images')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => galleryService.updateItem(id, payload),
    onSuccess: () => { toast.success(t('تم التحديث', 'Updated')); invalidate(); setModalItem(null); },
    onError: () => toast.error(t('حدث خطأ', 'Error updating item')),
  });

  const deleteMut = useMutation({
    mutationFn: galleryService.deleteItem,
    onSuccess: () => { toast.success(t('تم الحذف', 'Deleted')); invalidate(); setItemToDelete(null); },
  });

  const toggleMut = useMutation({
    mutationFn: galleryService.toggleStatus,
    onSuccess: () => invalidate(),
  });

  const replaceImgMut = useMutation({
    mutationFn: ({ id, file }) => galleryService.replaceImage(id, file),
    onSuccess: () => { toast.success(t('تم تغيير الصورة', 'Image replaced')); invalidate(); setItemToReplace(null); setReplaceFile(null); },
  });

  const reorderMut = useMutation({ mutationFn: galleryService.reorderItems });

  const handleBulkUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      createMut.mutate(filesArray);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || search) return; // disable reorder when searching
    const oldIdx = items.findIndex(i => i._id === active.id);
    const newIdx = items.findIndex(i => i._id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);

    qc.setQueryData(['gallery-admin'], (old) => ({ ...old, data: reordered }));
    reorderMut.mutate(reordered.map((item, idx) => ({ id: item._id, order: idx + 1 })));
  };

  const openEdit = (item) => {
    reset({
      titleAr: item.titleAr || '', titleEn: item.titleEn || '',
      locationAr: item.locationAr || '', locationEn: item.locationEn || '',
      descriptionAr: item.descriptionAr || '', descriptionEn: item.descriptionEn || '',
    });
    setModalItem(item);
  };

  const onSubmit = (values) => {
    updateMut.mutate({ id: modalItem._id, payload: values });
  };

  const onReplaceSubmit = (e) => {
    e.preventDefault();
    if (!replaceFile) return;
    replaceImgMut.mutate({ id: itemToReplace._id, file: replaceFile });
  };

  return (
    <div className="gallery-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('معرض الصور', 'Gallery')}</h1>
          <p className="section-subtitle">
            {t('إدارة صور المشاريع السابقة', 'Manage previous projects gallery images')}
          </p>
        </div>
      </div>

      <div className="gallery-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder={t('ابحث عن مشروع...', 'Search projects...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        className="gallery-upload-zone"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={32} />
        <p>{t('انقر لرفع صور جديدة (يمكنك اختيار عدة صور)', 'Click to upload new images (you can select multiple)')}</p>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          multiple 
          hidden 
          onChange={handleBulkUpload}
        />
        {createMut.isPending && <div className="spinner" style={{marginTop: 8}}/>}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="spinner-wrap" style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
          <p>{t('لا توجد صور', 'No images found')}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map(i => i._id)} strategy={rectSortingStrategy}>
            <div className="gallery-grid">
              {filteredItems.map(item => (
                <SortableGalleryItem 
                  key={item._id} 
                  item={item} 
                  lang={lang} 
                  onEdit={openEdit} 
                  onDelete={setItemToDelete} 
                  onToggle={(id) => toggleMut.mutate(id)} 
                  onReplaceImage={setItemToReplace}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Info Modal */}
      {modalItem && createPortal(
        <div className="overlay" onClick={() => setModalItem(null)}>
          <div className="gallery-modal" onClick={e => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>{t('تعديل معلومات المشروع', 'Edit Project Info')}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setModalItem(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="gallery-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>{t('عنوان المشروع (عربي)', 'Project Title (Arabic)')}</label>
                    <input dir="rtl" className="form-input" {...register('titleAr')} />
                  </div>
                  <div className="form-group">
                    <label>{t('عنوان المشروع (إنجليزي)', 'Project Title (English)')}</label>
                    <input dir="ltr" className="form-input" {...register('titleEn')} />
                  </div>
                  <div className="form-group">
                    <label>{t('الموقع (عربي)', 'Location (Arabic)')}</label>
                    <input dir="rtl" className="form-input" {...register('locationAr')} />
                  </div>
                  <div className="form-group">
                    <label>{t('الموقع (إنجليزي)', 'Location (English)')}</label>
                    <input dir="ltr" className="form-input" {...register('locationEn')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t('وصف قصير (عربي)', 'Short Description (Arabic)')}</label>
                    <textarea dir="rtl" rows={2} className="form-input" {...register('descriptionAr')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{t('وصف قصير (إنجليزي)', 'Short Description (English)')}</label>
                    <textarea dir="ltr" rows={2} className="form-input" {...register('descriptionEn')} />
                  </div>
                </div>
              </div>
              <div className="gallery-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalItem(null)}>{t('إلغاء', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || updateMut.isPending}>
                  {updateMut.isPending ? <span className="spinner" /> : t('حفظ التعديلات', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Replace Image Modal */}
      {itemToReplace && createPortal(
        <div className="overlay" onClick={() => { setItemToReplace(null); setReplaceFile(null); }}>
          <div className="gallery-modal" onClick={e => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h2>{t('تغيير الصورة', 'Replace Image')}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => { setItemToReplace(null); setReplaceFile(null); }}><X size={18} /></button>
            </div>
            <form onSubmit={onReplaceSubmit}>
              <div className="gallery-modal-body" style={{ alignItems: 'center' }}>
                <img 
                  src={replaceFile ? URL.createObjectURL(replaceFile) : `${BASE_URL}${itemToReplace.thumbnail}`} 
                  alt="Preview" 
                  className="replace-image-preview" 
                />
                <button type="button" className="btn btn-secondary" onClick={() => replaceInputRef.current?.click()}>
                  <ImagePlus size={16} style={{marginRight: 8}}/> {t('اختر صورة جديدة', 'Select New Image')}
                </button>
                <input 
                  ref={replaceInputRef} 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  onChange={(e) => {
                    if (e.target.files[0]) setReplaceFile(e.target.files[0]);
                  }} 
                />
              </div>
              <div className="gallery-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setItemToReplace(null); setReplaceFile(null); }}>{t('إلغاء', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={!replaceFile || replaceImgMut.isPending}>
                  {replaceImgMut.isPending ? <span className="spinner" /> : t('حفظ الصورة', 'Save Image')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm */}
      {itemToDelete && createPortal(
        <div className="overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('تأكيد الحذف', 'Confirm Delete')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('هل أنت متأكد من حذف هذه الصورة؟', 'Are you sure you want to delete this image?')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setItemToDelete(null)}>{t('إلغاء', 'Cancel')}</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(itemToDelete._id)}>
                {deleteMut.isPending ? <span className="spinner" /> : t('حذف', 'Delete')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GalleryPage;
