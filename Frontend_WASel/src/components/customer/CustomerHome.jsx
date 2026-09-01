import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import Badge from '../common/Badge';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHome({ onSelectStore }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useNotifications();
  const { t } = useAuth();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await storeApi.getOpenStores();
      setStores(data || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
      showToast(t('noOpenStores'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">{t('heroTitle')}</h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>

          {/* Search Input */}
          <div style={{ position: 'relative', maxWidth: '440px' }}>
            <input
              type="text"
              className="form-input"
              style={{
                paddingInlineStart: '2.5rem',
                borderRadius: 'var(--radius-full)',
                height: '46px',
                fontSize: '0.95rem'
              }}
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span style={{ position: 'absolute', top: '12px', insetInlineStart: '14px', fontSize: '1.1rem' }}>
              🔍
            </span>
          </div>
        </div>

        <div style={{ fontSize: '5.5rem', opacity: 0.9, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
          🍔🛵🍕
        </div>
      </section>

      {/* Stores List Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t('openStoresTitle')}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {filteredStores.length} {t('storesCountSuffix')}
          </span>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={fetchStores}>
          {t('refreshList')}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>{t('loadingStores')}</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏬</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {search ? t('noStoresFound') : t('noOpenStores')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {t('noStoresOwnerHint')}
          </p>
        </div>
      ) : (
        <div className="grid-stores">
          {filteredStores.map(store => (
            <div 
              key={store.id} 
              className="card card-interactive"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => onSelectStore(store)}
            >
              {/* Store Card Header with Banner Mock */}
              <div style={{
                height: '110px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.8rem',
                marginBottom: '1rem',
                position: 'relative'
              }}>
                🏪
                <div style={{ position: 'absolute', top: '8px', insetInlineEnd: '8px' }}>
                  <Badge status={store.status} />
                </div>
              </div>

              {/* Store Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{store.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    <span>⭐</span>
                    <span style={{ fontSize: '0.9rem' }}>{store.rating ? store.rating.toFixed(1) : t('storeRatingNew')}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '38px', lineHeight: 1.4 }}>
                  {store.description || ''}
                </p>
              </div>

              {/* Store Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  🛵 {t('deliveryFeeLabel')}: <strong style={{ color: 'var(--text-primary)' }}>{store.deliveryFee} {t('currency')}</strong>
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {t('browseMenu')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
