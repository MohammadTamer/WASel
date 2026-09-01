import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, theme, toggleTheme, lang, toggleLang, logout, t } = useAuth();
  const { totalItemsCount, setIsDrawerOpen } = useCart();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div 
          className="brand-logo" 
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('home')}
        >
          <div className="brand-icon">🛵</div>
          <div>
            <span>{t('brandName')}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginInlineStart: '0.4rem', fontWeight: 500 }}>
              {t('brandSubtitle')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (For Customers/Guests) */}
        <nav className="nav-links">
          {(!user || user.role === 'CUSTOMER') && (
            <>
              <button 
                className={`nav-btn ${activeTab === 'home' || activeTab === 'stores' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                {t('navStores')}
              </button>
              {user && (
                <>
                  <button 
                    className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    {t('navMyOrders')}
                  </button>
                  <button 
                    className={`nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    {t('navMyAddresses')}
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Theme Switcher */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            title={theme === 'light' ? t('toggleThemeDark') : t('toggleThemeLight')}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Lang Switcher */}
          <button 
            className="btn-icon" 
            onClick={toggleLang}
            title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            style={{ fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Notifications Button */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-icon" 
                onClick={() => setShowNotifications(!showNotifications)}
                title={t('notifications')}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: 'var(--accent-rose)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            </div>
          )}

          {/* Cart Header Icon (Only for Logged-In Customers) */}
          {user && user.role === 'CUSTOMER' && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsDrawerOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>🛒 {t('cart')}</span>
              {totalItemsCount > 0 && (
                <span style={{
                  background: 'white',
                  color: 'var(--primary-dark)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.75rem'
                }}>
                  {totalItemsCount}
                </span>
              )}
            </button>
          )}

          {/* Auth Button / User Profile */}
          {!user ? (
            <button className="btn btn-outline btn-sm" onClick={onOpenAuth}>
              {t('loginRegister')}
            </button>
          ) : (
            <button 
              className="btn btn-ghost btn-sm"
              onClick={logout}
              style={{ color: 'var(--accent-rose)' }}
            >
              {t('logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
