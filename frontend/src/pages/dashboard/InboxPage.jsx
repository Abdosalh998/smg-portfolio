import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search, Trash2, MailOpen, Mail, RefreshCw, ChevronLeft, ChevronRight,
  Inbox as InboxIcon, User, Building, Phone, AtSign, Clock, X,
} from 'lucide-react';
import inboxService from '../../services/inbox.service';
import './InboxPage.css';

const InboxPage = () => {
  const { lang } = useOutletContext();
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);

  const queryKey = ['inbox', { page, search, isRead: filterRead }];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => inboxService.getAll({ page, search, isRead: filterRead }),
    keepPreviousData: true,
  });

  const messages = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inbox'] });

  const markReadMut  = useMutation({ mutationFn: inboxService.markRead,  onSuccess: invalidate });
  const markUnreadMut= useMutation({ mutationFn: inboxService.markUnread,onSuccess: invalidate });
  const deleteMut    = useMutation({
    mutationFn: inboxService.delete,
    onSuccess: () => { invalidate(); if (selectedMsg) setSelectedMsg(null); toast.success(t('تم الحذف', 'Deleted')); }
  });
  const bulkReadMut  = useMutation({ mutationFn: inboxService.bulkMarkRead,  onSuccess: () => { invalidate(); setCheckedIds([]); } });
  const bulkDeleteMut= useMutation({ mutationFn: inboxService.bulkDelete,    onSuccess: () => { invalidate(); setCheckedIds([]); toast.success(t('تم الحذف', 'Deleted')); } });

  const openMessage = useCallback((msg) => {
    setSelectedMsg(msg);
    if (!msg.isRead) {
      markReadMut.mutate(msg._id);
    }
  }, [markReadMut]);

  const toggleCheck = (id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (checkedIds.length === messages.length) setCheckedIds([]);
    else setCheckedIds(messages.map(m => m._id));
  };

  const formatDate = (date) => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));

  return (
    <div className="inbox-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('صندوق الوارد', 'Inbox')}</h1>
          <p className="section-subtitle">{t('إدارة الرسائل الواردة من زوار الموقع', 'Manage incoming messages from website visitors')}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={invalidate} disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
          {t('تحديث', 'Refresh')}
        </button>
      </div>

      {/* Toolbar */}
      <div className="inbox-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('ابحث في الرسائل...', 'Search messages...')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="inbox-filter-tabs">
          {[
            { val: '',      ar: 'الكل',       en: 'All' },
            { val: 'false', ar: 'غير مقروء',  en: 'Unread' },
            { val: 'true',  ar: 'مقروء',      en: 'Read' },
          ].map(f => (
            <button
              key={f.val}
              className={`inbox-filter-tab ${filterRead === f.val ? 'active' : ''}`}
              onClick={() => { setFilterRead(f.val); setPage(1); }}
            >
              {t(f.ar, f.en)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Bar */}
      {checkedIds.length > 0 && (
        <div className="inbox-bulk-bar">
          <span>{checkedIds.length} {t('محدد', 'selected')}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => bulkReadMut.mutate(checkedIds)}>
            <MailOpen size={14} /> {t('قراءة الكل', 'Mark All Read')}
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => bulkDeleteMut.mutate(checkedIds)}>
            <Trash2 size={14} /> {t('حذف الكل', 'Delete All')}
          </button>
          <button className="btn btn-sm btn-ghost" style={{ marginRight: 'auto' }} onClick={() => setCheckedIds([])}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Message List + Detail */}
      <div className={`inbox-container ${selectedMsg ? 'has-selection' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* List */}
        <div className="inbox-list-col">
          {isLoading ? (
            <div className="inbox-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 12, width: '70%' }} />
                  </div>
                  <div className="skeleton" style={{ height: 12, width: 70 }} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="inbox-empty">
              <InboxIcon size={48} strokeWidth={1} />
              <p>{t('لا توجد رسائل', 'No messages found')}</p>
            </div>
          ) : (
            <div className="inbox-list">
              {/* Select All header */}
              <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-elevated)' }}>
                <input
                  type="checkbox"
                  checked={checkedIds.length === messages.length && messages.length > 0}
                  onChange={toggleAll}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {t('تحديد الكل', 'Select all')} ({pagination.total || 0})
                </span>
              </div>

              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`inbox-row ${!msg.isRead ? 'unread' : ''} ${selectedMsg?._id === msg._id ? 'active' : ''}`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="inbox-row-check" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(msg._id)}
                      onChange={() => toggleCheck(msg._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="inbox-row-body" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="inbox-row-top">
                      <span className="inbox-row-name">{msg.fullName}</span>
                      {!msg.isRead && <span className="badge badge-danger" style={{ fontSize: 10 }}>{t('جديد', 'New')}</span>}
                    </div>
                    <div className="inbox-row-subject">{msg.subject}</div>
                    <div className="inbox-row-meta">{formatDate(msg.createdAt)}</div>
                  </div>
                  <div className="inbox-row-actions" onClick={e => e.stopPropagation()}>
                    {msg.isRead
                      ? <button className="btn btn-icon btn-ghost" title={t('تحديد كغير مقروء', 'Mark unread')} onClick={() => markUnreadMut.mutate(msg._id)}><Mail size={14} /></button>
                      : <button className="btn btn-icon btn-ghost" title={t('تحديد كمقروء', 'Mark read')} onClick={() => markReadMut.mutate(msg._id)}><MailOpen size={14} /></button>
                    }
                    <button className="btn btn-icon btn-danger" title={t('حذف', 'Delete')} onClick={() => deleteMut.mutate(msg._id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="inbox-pagination">
              <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span>{t(`صفحة ${page} من ${pagination.pages}`, `Page ${page} of ${pagination.pages}`)}</span>
              <button className="btn btn-sm btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedMsg && (
          <div className="inbox-detail" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="inbox-detail-header">
              <div>
                <div className="inbox-detail-subject">{selectedMsg.subject}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedMsg.isRead
                  ? <button className="btn btn-sm btn-secondary" onClick={() => markUnreadMut.mutate(selectedMsg._id)}><Mail size={14} /> {t('غير مقروء', 'Mark Unread')}</button>
                  : <button className="btn btn-sm btn-secondary" onClick={() => markReadMut.mutate(selectedMsg._id)}><MailOpen size={14} /> {t('مقروء', 'Mark Read')}</button>
                }
                <button className="btn btn-sm btn-danger" onClick={() => deleteMut.mutate(selectedMsg._id)}><Trash2 size={14} /></button>
                <button className="btn btn-sm btn-ghost" onClick={() => setSelectedMsg(null)}><X size={14} /></button>
              </div>
            </div>

            <div className="inbox-detail-meta">
              <div className="inbox-meta-row"><User size={14} /> <strong>{t('الاسم:', 'Name:')}</strong> {selectedMsg.fullName}</div>
              {selectedMsg.companyName && <div className="inbox-meta-row"><Building size={14} /> <strong>{t('الشركة:', 'Company:')}</strong> {selectedMsg.companyName}</div>}
              <div className="inbox-meta-row"><Phone size={14} /> <strong>{t('الهاتف:', 'Phone:')}</strong> <a href={`tel:${selectedMsg.phone}`}>{selectedMsg.phone}</a></div>
              <div className="inbox-meta-row"><AtSign size={14} /> <strong>{t('الإيميل:', 'Email:')}</strong> <a href={`mailto:${selectedMsg.email}`}>{selectedMsg.email}</a></div>
              <div className="inbox-meta-row"><Clock size={14} /> <strong>{t('التاريخ:', 'Date:')}</strong> {formatDate(selectedMsg.createdAt)}</div>
            </div>

            <div className="inbox-detail-body">{selectedMsg.message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;

// local helper for formatDate closure
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}
