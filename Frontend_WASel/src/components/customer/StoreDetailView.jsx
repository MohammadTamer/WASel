import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function StoreDetailView({ store, onBack, onOpenAuth }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, updateQuantity } = useCart();
  const { showToast } = useNotifications();
  const { user, isAuthenticated, t } = useAuth();

  useEffect(() => {
    const loadStoreData = async () => {
      setLoading(true);
      try {
        const [prodData, catData] = await Promise.all([
          storeApi.getProducts(store.id),
          storeApi.getCategories(store.id).catch(() => [])
        ]);
        setProducts(prodData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error(err);
        showToast(t('loadingProducts'), 'error');
      } finally {
        setLoading(false);
      }
    };
    loadStoreData();
  }, [store.id]);

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => p.categoryId === Number(selectedCategory));

  const getItemQuantity = (productId) => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') return 0;
    const found = cart.items.find(i => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      showToast(t('loginRequiredToCart'), 'error');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    addToCart(product, store);
    showToast(`${product.name} +`, 'success');
  };

  const handleUpdateQuantity = (productId, delta) => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      showToast(t('loginRequiredToCart'), 'error');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    updateQuantity(productId, delta);
  };

  return (
    <div>
      {/* Back button */}
      <button 
        className="btn btn-ghost btn-sm" 
        onClick={onBack}
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        {t('backToStores')}
      </button>

      {/* Store Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}>
              🏪
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{store.name}</h1>
                <Badge status={store.status} />
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                {store.description || ''}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>📍 {store.address || 'Address'}</span>
                <span>•</span>
                <span>🛵 {t('deliveryFeeLabel')}: <strong>{store.deliveryFee} {t('currency')}</strong></span>
                {store.phone && (
                  <>
                    <span>•</span>
                    <span>📞 {store.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            padding: '0.8rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{t('storeRating')}</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
              ⭐ {store.rating ? store.rating.toFixed(1) : '5.0'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs Filter */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            className={`btn btn-sm ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            {t('allCategories')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${selectedCategory === String(cat.id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>{t('loadingProducts')}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
          <h3>{t('noProductsInCategory')}</h3>
        </div>
      ) : (
        <div className="grid-products">
          {filteredProducts.map(product => {
            const qty = getItemQuantity(product.id);
            const isAvailable = product.isAvailable !== false;

            return (
              <div 
                key={product.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isAvailable ? 1 : 0.6
                }}
              >
                {/* Product Image / Mock Icon */}
                <div style={{
                  height: '130px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3.5rem',
                  marginBottom: '1rem',
                  position: 'relative'
                }}>
                  🍔
                  {!isAvailable && (
                    <span style={{
                      position: 'absolute',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {t('outOfStock')}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{product.name}</h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, minHeight: '36px' }}>
                    {product.description || ''}
                  </p>
                </div>

                {/* Price & Cart Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                    {product.price} {t('currency')}
                  </strong>

                  {isAvailable && (
                    qty === 0 ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        {t('addToCart')}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn-icon btn-sm"
                          style={{ width: 28, height: 28 }}
                          onClick={() => handleUpdateQuantity(product.id, -1)}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: 20, textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button
                          className="btn-icon btn-sm"
                          style={{ width: 28, height: 28 }}
                          onClick={() => handleUpdateQuantity(product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
