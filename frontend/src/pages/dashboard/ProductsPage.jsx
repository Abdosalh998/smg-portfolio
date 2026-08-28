import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
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
  ImagePlus, X, Package, FileText, Search, Filter, UploadCloud
} from 'lucide-react';

import productService from '../../services/product.service';
import './ProductsPage.css';

import BASE_URL from '../../utils/baseUrl';

const SortableRow = ({ item, lang, onEdit, onDelete, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const name = lang === 'ar' ? item.nameAr : item.nameEn;
  const cat = lang === 'ar' ? item.categoryAr : item.categoryEn;
  const imgSrc = item.mainImage ? `${BASE_URL}${item.mainImage}` : null;

  return (
    <div ref={setNodeRef} style={style} className={`prod-row${!item.isActive ? ' prod-row--inactive' : ''}`}>
      <button className="prod-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={18} />
      </button>

      <div className="prod-row-icon">
        {imgSrc
          ? <img src={imgSrc} alt={name} className="prod-row-img" />
          : <Package size={22} />}
      </div>

      <div className="prod-row-info">
        <span className="prod-row-title">{name}</span>
        <span className="prod-row-cat">{cat}</span>
        {!item.isActive && <span className="badge badge-warning" style={{ fontSize: 10, marginLeft: 8 }}>Hidden</span>}
      </div>

      <div className="prod-row-actions">
        <button type="button" className={`btn btn-icon ${item.isActive ? 'btn-ghost' : 'btn-secondary'}`} onClick={() => onToggle(item._id)}>
          {item.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button type="button" className="btn btn-icon btn-ghost" onClick={() => onEdit(item)}>
          <Pencil size={15} />
        </button>
        <button type="button" className="btn btn-icon btn-danger" onClick={() => onDelete(item)}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const { lang } = useOutletContext();
  const qc = useQueryClient();
  const t = (ar, en) => lang === 'ar' ? ar : en;

  const [modalItem, setModalItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Upload refs & state for the modal
  const [mainImgFile, setMainImgFile] = useState(null);
  const [mainImgPreview, setMainImgPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

  const mainImgRef = useRef(null);
  const galleryRef = useRef(null);
  const pdfRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Form setup
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm();

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control, name: 'specifications'
  });
  const { fields: featArFields, append: appendFeatAr, remove: removeFeatAr } = useFieldArray({
    control, name: 'featuresAr'
  });
  const { fields: featEnFields, append: appendFeatEn, remove: removeFeatEn } = useFieldArray({
    control, name: 'featuresEn'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products-admin'],
    queryFn: () => productService.getAll(true),
  });
  const items = data?.data ?? [];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.nameAr.toLowerCase().includes(search.toLowerCase()) || 
                          item.nameEn.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat ? item.categoryEn === filterCat || item.categoryAr === filterCat : true;
      return matchSearch && matchCat;
    });
  }, [items, search, filterCat]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => lang === 'ar' ? i.categoryAr : i.categoryEn));
    return Array.from(cats);
  }, [items, lang]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['products-admin'] });

  const createMut = useMutation({
    mutationFn: productService.create,
    onSuccess: () => { toast.success(t('تم الإضافة', 'Added')); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => productService.update(id, payload),
    onSuccess: () => { toast.success(t('تم التحديث', 'Updated')); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || t('حدث خطأ', 'Error')),
  });

  const deleteMut = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => { toast.success(t('تم الحذف', 'Deleted')); invalidate(); setItemToDelete(null); },
  });

  const toggleMut = useMutation({
    mutationFn: productService.toggleStatus,
    onSuccess: () => invalidate(),
  });

  const reorderMut = useMutation({ mutationFn: productService.reorder });

  // File mutations
  const uploadMainImgMut = useMutation({ mutationFn: ({ id, file }) => productService.uploadMainImage(id, file) });
  const uploadGalleryMut = useMutation({ mutationFn: ({ id, files }) => productService.uploadGalleryImages(id, files) });
  const deleteGalleryImgMut = useMutation({
    mutationFn: ({ id, imagePath }) => productService.deleteGalleryImage(id, imagePath),
    onSuccess: () => invalidate(),
  });
  const uploadPdfMut = useMutation({ mutationFn: ({ id, file }) => productService.uploadDatasheet(id, file) });
  const deletePdfMut = useMutation({
    mutationFn: (id) => productService.deleteDatasheet(id),
    onSuccess: () => invalidate(),
  });

  const openNew = () => {
    reset({
      nameAr: '', nameEn: '', categoryAr: '', categoryEn: '',
      shortDescriptionAr: '', shortDescriptionEn: '', fullDescriptionAr: '', fullDescriptionEn: '',
      specifications: [], featuresAr: [], featuresEn: [], isActive: true
    });
    setMainImgPreview(null); setMainImgFile(null); setGalleryFiles([]); setPdfFile(null);
    setModalItem({});
  };

  const openEdit = (item) => {
    // Transform arrays for React Hook Form string mapping if needed
    const fAr = (item.featuresAr || []).map(val => ({ value: val }));
    const fEn = (item.featuresEn || []).map(val => ({ value: val }));

    reset({
      nameAr: item.nameAr, nameEn: item.nameEn,
      categoryAr: item.categoryAr, categoryEn: item.categoryEn,
      shortDescriptionAr: item.shortDescriptionAr, shortDescriptionEn: item.shortDescriptionEn,
      fullDescriptionAr: item.fullDescriptionAr, fullDescriptionEn: item.fullDescriptionEn,
      specifications: item.specifications || [],
      featuresAr: fAr,
      featuresEn: fEn,
      isActive: item.isActive,
    });
    setMainImgPreview(item.mainImage ? `${BASE_URL}${item.mainImage}` : null);
    setMainImgFile(null); setGalleryFiles([]); setPdfFile(null);
    setModalItem(item);
  };

  const closeModal = () => setModalItem(null);

  const onSubmit = async (values) => {
    try {
      // Re-map features to simple string arrays
      const payload = { ...values };
      payload.featuresAr = payload.featuresAr.map(f => f.value).filter(Boolean);
      payload.featuresEn = payload.featuresEn.map(f => f.value).filter(Boolean);

      let productId = modalItem._id;

      if (productId) {
        await updateMut.mutateAsync({ id: productId, payload });
      } else {
        const res = await createMut.mutateAsync(payload);
        productId = res.data._id;
      }

      // Handle uploads sequentially to avoid overload
      if (mainImgFile) await uploadMainImgMut.mutateAsync({ id: productId, file: mainImgFile });
      if (galleryFiles.length > 0) await uploadGalleryMut.mutateAsync({ id: productId, files: galleryFiles });
      if (pdfFile) await uploadPdfMut.mutateAsync({ id: productId, file: pdfFile });

      invalidate();
      closeModal();
    } catch (e) {
      console.error(e);
      // errors handled by individual mutations usually
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || search || filterCat) return; // disable reorder when filtered
    const oldIdx = items.findIndex(i => i._id === active.id);
    const newIdx = items.findIndex(i => i._id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);

    qc.setQueryData(['products-admin'], (old) => ({ ...old, data: reordered }));
    reorderMut.mutate(reordered.map((item, idx) => ({ id: item._id, order: idx + 1 })));
  };

  return (
    <div className="prod-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('المنتجات', 'Products')}</h1>
          <p className="section-subtitle">
            {t('إدارة جميع المنتجات والمواصفات الفنية', 'Manage all products and technical specifications')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> {t('إضافة منتج', 'Add Product')}
        </button>
      </div>

      <div className="prod-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder={t('ابحث عن منتج...', 'Search products...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">{t('جميع الأقسام', 'All Categories')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="prod-empty">
            <Package size={48} />
            <p>{t('لا توجد منتجات', 'No products found')}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
              <div className="prod-list">
                {filteredItems.map(item => (
                  <SortableRow key={item._id} item={item} lang={lang} onEdit={openEdit} onDelete={setItemToDelete} onToggle={(id) => toggleMut.mutate(id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {modalItem !== null && createPortal(
        <div className="overlay" onClick={closeModal}>
          <div className="prod-modal" onClick={e => e.stopPropagation()}>
            <div className="prod-modal-header">
              <h2>{modalItem._id ? t('تعديل منتج', 'Edit Product') : t('إضافة منتج', 'Add Product')}</h2>
              <button className="btn btn-icon btn-ghost" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="prod-form" noValidate>
              
              {/* Basic Info */}
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('اسم المنتج (عربي)', 'Name (Arabic)')} *</label>
                  <input dir="rtl" className="form-input" {...register('nameAr', { required: true })} />
                </div>
                <div className="form-group">
                  <label>{t('اسم المنتج (إنجليزي)', 'Name (English)')} *</label>
                  <input dir="ltr" className="form-input" {...register('nameEn', { required: true })} />
                </div>
                <div className="form-group">
                  <label>{t('القسم (عربي)', 'Category (Arabic)')} *</label>
                  <input dir="rtl" className="form-input" {...register('categoryAr', { required: true })} />
                </div>
                <div className="form-group">
                  <label>{t('القسم (إنجليزي)', 'Category (English)')} *</label>
                  <input dir="ltr" className="form-input" {...register('categoryEn', { required: true })} />
                </div>
              </div>

              {/* Descriptions */}
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('وصف قصير (عربي)', 'Short Desc (Arabic)')}</label>
                  <textarea dir="rtl" rows={2} className="form-input" {...register('shortDescriptionAr')} />
                </div>
                <div className="form-group">
                  <label>{t('وصف قصير (إنجليزي)', 'Short Desc (English)')}</label>
                  <textarea dir="ltr" rows={2} className="form-input" {...register('shortDescriptionEn')} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('وصف كامل (عربي)', 'Full Desc (Arabic)')}</label>
                  <textarea dir="rtl" rows={4} className="form-input" {...register('fullDescriptionAr')} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('وصف كامل (إنجليزي)', 'Full Desc (English)')}</label>
                  <textarea dir="ltr" rows={4} className="form-input" {...register('fullDescriptionEn')} />
                </div>
              </div>

              {/* Specifications */}
              <div className="form-group prod-array-group">
                <label className="flex-between">
                  {t('المواصفات الفنية', 'Technical Specifications')}
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => appendSpec({ keyAr:'', keyEn:'', valAr:'', valEn:'' })}>
                    <Plus size={14} /> {t('إضافة صف', 'Add Row')}
                  </button>
                </label>
                <div className="prod-spec-list">
                  {specFields.map((field, idx) => (
                    <div key={field.id} className="prod-spec-row">
                      <input dir="rtl" placeholder="الخاصية (ع)" className="form-input" {...register(`specifications.${idx}.keyAr`)} />
                      <input dir="ltr" placeholder="Key (En)" className="form-input" {...register(`specifications.${idx}.keyEn`)} />
                      <input dir="rtl" placeholder="القيمة (ع)" className="form-input" {...register(`specifications.${idx}.valAr`)} />
                      <input dir="ltr" placeholder="Value (En)" className="form-input" {...register(`specifications.${idx}.valEn`)} />
                      <button type="button" className="btn btn-icon btn-danger" onClick={() => removeSpec(idx)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="form-grid">
                <div className="form-group prod-array-group">
                  <label className="flex-between">
                    {t('المميزات (عربي)', 'Features (Arabic)')}
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => appendFeatAr({ value: '' })}><Plus size={14} /></button>
                  </label>
                  {featArFields.map((f, idx) => (
                    <div key={f.id} className="prod-feat-row">
                      <input dir="rtl" className="form-input" {...register(`featuresAr.${idx}.value`)} />
                      <button type="button" className="btn-icon btn-danger" onClick={() => removeFeatAr(idx)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
                <div className="form-group prod-array-group">
                  <label className="flex-between">
                    {t('المميزات (إنجليزي)', 'Features (English)')}
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => appendFeatEn({ value: '' })}><Plus size={14} /></button>
                  </label>
                  {featEnFields.map((f, idx) => (
                    <div key={f.id} className="prod-feat-row">
                      <input dir="ltr" className="form-input" {...register(`featuresEn.${idx}.value`)} />
                      <button type="button" className="btn-icon btn-danger" onClick={() => removeFeatEn(idx)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Files Upload */}
              <div className="prod-files-section">
                {/* Main Image */}
                <div className="prod-file-box">
                  <label>{t('الصورة الرئيسية', 'Main Image')} (Max 5MB)</label>
                  {mainImgPreview ? (
                    <div className="prod-file-preview">
                      <img src={mainImgPreview} alt="Main" />
                      <button type="button" className="remove-btn" onClick={() => { setMainImgPreview(null); setMainImgFile(null); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="upload-btn" onClick={() => mainImgRef.current?.click()}>
                      <ImagePlus size={20} /> {t('اختر صورة', 'Select Image')}
                    </button>
                  )}
                  <input ref={mainImgRef} type="file" accept="image/*" hidden onChange={(e) => {
                    if (e.target.files[0]) {
                      setMainImgFile(e.target.files[0]);
                      setMainImgPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
                </div>

                {/* PDF Datasheet */}
                <div className="prod-file-box">
                  <label>{t('ملف المواصفات PDF', 'PDF Datasheet')} (Max 20MB)</label>
                  {pdfFile || modalItem?.datasheet ? (
                    <div className="prod-file-preview pdf-preview">
                      <FileText size={24} color="var(--accent-500)" />
                      <span>{pdfFile ? pdfFile.name : t('يوجد ملف مسجل', 'Datasheet exists')}</span>
                      <button type="button" className="remove-btn" onClick={() => { 
                        setPdfFile(null); 
                        if (modalItem?._id && modalItem.datasheet) deletePdfMut.mutate(modalItem._id);
                      }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="upload-btn" onClick={() => pdfRef.current?.click()}>
                      <UploadCloud size={20} /> {t('اختر ملف', 'Select PDF')}
                    </button>
                  )}
                  <input ref={pdfRef} type="file" accept="application/pdf" hidden onChange={(e) => {
                    if (e.target.files[0]) setPdfFile(e.target.files[0]);
                  }} />
                </div>
              </div>

              {/* Gallery */}
              <div className="form-group">
                <label className="flex-between">
                  {t('معرض الصور (اختياري)', 'Gallery Images (Optional)')}
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => galleryRef.current?.click()}>
                    <Plus size={14} /> {t('إضافة صور', 'Add Images')}
                  </button>
                  <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={(e) => {
                    if (e.target.files) setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)]);
                  }} />
                </label>
                <div className="prod-gallery-grid">
                  {modalItem?.galleryImages?.map((img, idx) => (
                    <div key={idx} className="prod-gallery-item">
                      <img src={`${BASE_URL}${img}`} alt="Gallery" />
                      <button type="button" onClick={() => deleteGalleryImgMut.mutate({ id: modalItem._id, imagePath: img })}><X size={12}/></button>
                    </div>
                  ))}
                  {galleryFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="prod-gallery-item new">
                      <img src={URL.createObjectURL(file)} alt="New Gallery" />
                      <button type="button" onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))}><X size={12}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <label>{t('تفعيل المنتج', 'Active Product')}</label>
                <label className="toggle-switch">
                  <input type="checkbox" {...register('isActive')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="prod-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>{t('إلغاء', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || uploadMainImgMut.isPending}>
                  {(isSubmitting || uploadMainImgMut.isPending) ? <span className="spinner" /> : null}
                  {t('حفظ المنتج', 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {itemToDelete && createPortal(
        <div className="overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('تأكيد الحذف', 'Confirm Delete')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('هل أنت متأكد من حذف المنتج؟ لا يمكن التراجع.', 'Are you sure you want to delete this product? This cannot be undone.')}</p>
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

export default ProductsPage;
