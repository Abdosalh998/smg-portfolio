import './ConfirmDialog.css';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, loading = false, lang = 'ar' }) => {
  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <AlertTriangle size={28} />
        </div>
        <button className="confirm-close btn btn-icon btn-ghost" onClick={onCancel}>
          <X size={16} />
        </button>
        <h3 className="confirm-title">{title || (lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete')}</h3>
        <p className="confirm-message">
          {message || (lang === 'ar' ? 'هل أنت متأكد من تنفيذ هذا الإجراء؟ لا يمكن التراجع عنه.' : 'Are you sure? This action cannot be undone.')}
        </p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} id="confirm-delete-btn">
            {loading ? (
              <><span className="spinner" />{lang === 'ar' ? 'جاري الحذف...' : 'Deleting...'}</>
            ) : (
              lang === 'ar' ? 'نعم، احذف' : 'Yes, Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
