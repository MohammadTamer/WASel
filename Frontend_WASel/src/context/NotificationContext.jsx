import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/services';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Toast System
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [list, countRes] = await Promise.all([
        notificationApi.getMyNotifications().catch(() => []),
        notificationApi.getUnreadCount().catch(() => ({ unreadCount: 0 }))
      ]);

      const items = list || [];
      
      // Check for incoming new unread notifications
      if (!isFirstLoadRef.current) {
        items.forEach(n => {
          if (!n.isRead && !seenIdsRef.current.has(n.id)) {
            showToast(`🔔 ${n.title}: ${n.message}`, 'info');
          }
        });
      }

      // Mark current items as seen
      items.forEach(n => seenIdsRef.current.add(n.id));
      isFirstLoadRef.current = false;

      setNotifications(items);
      setUnreadCount(countRes?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      isFirstLoadRef.current = true;
      seenIdsRef.current = new Set();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000); // Live poll every 4s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      seenIdsRef.current = new Set();
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      showToast
    }}>
      {children}
      {/* Toast Render */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '🔔'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
