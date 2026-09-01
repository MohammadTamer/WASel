import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useAuth();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      insetInlineStart: 0,
      marginTop: '0.5rem',
      width: '320px',
      maxHeight: '400px',
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <strong style={{ fontSize: '0.95rem' }}>{t('notifications')}</strong>
        {notifications.some(n => !n.isRead) && (
          <button 
            className="btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
            onClick={markAllAsRead}
          >
            {t('markAllRead')}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '320px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {t('noNotifications')}
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => !item.isRead && markAsRead(item.id)}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: item.isRead ? 'transparent' : 'var(--primary-light)',
                cursor: item.isRead ? 'default' : 'pointer',
                transition: 'background var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.title}</span>
                {!item.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></span>}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                {item.message}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
