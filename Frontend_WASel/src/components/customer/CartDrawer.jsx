import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { addressApi } from '../../api/services';
import { orderApi } from '../../api/orderApi';
import AddressModal from '../auth/AddressModal';

export default function CartDrawer({ onOrderSuccess, onOpenAuth }) {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalAmount, isDrawerOpen, setIsDrawerOpen } = useCart();
  const { isAuthenticated, t } = useAuth();
  const { showToast } = useNotifications();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    if (!isAuthenticated) return;
    try {
      const list = await addressApi.getMyAddresses();
      setAddresses(list || []);
      if (list && list.length > 0 && !selectedAddressId) {
        const defaultAddr = list.find(a => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isDrawerOpen && isAuthenticated) {
      fetchAddresses();
    }
  }, [isDrawerOpen, isAuthenticated]);

  if (!isDrawerOpen) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setIsDrawerOpen(false);
      onOpenAuth();
      showToast(t('loginToSelectAddress'), 'info');
      return;
    }

    if (!selectedAddressId) {
      showToast(t('deliveryAddress'), 'error');
      return;
    }

    if (cart.items.length === 0) {
      showToast(t('cartEmpty'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        storeId: cart.storeId,
        addressId: selectedAddressId,
        notes: orderNotes,
        items: cart.items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          notes: i.note || ''
        }))
      };

      const createdOrder = await orderApi.createOrder(orderPayload);
      showToast(`${t('orderNumber')} ${createdOrder.orderNumber || createdOrder.id} 🎉`, 'success');
      clearCart();
      setIsDrawerOpen(false);
      if (onOrderSuccess) onOrderSuccess(createdOrder);
    } catch (err) {
      showToast(err.message || 'Order failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
        <div className="drawer-panel" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="drawer-header">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('cartTitle')}</h3>
              {cart.storeName && (
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {t('fromStore')} {cart.storeName}
                </span>
              )}
            </div>
            <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
          </div>

          {/* Body */}
          <div className="drawer-body">
            {cart.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t('cartEmpty')}</h4>
                <p style={{ fontSize: '0.85rem' }}>{t('cartEmptyHint')}</p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {cart.items.map(item => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.92rem', display: 'block' }}>{item.product.name}</strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {item.product.price} {t('currency')} × {item.quantity} = <strong>{(item.product.price * item.quantity).toFixed(2)} {t('currency')}</strong>
                        </span>
                      </div>

                      {/* Quantity Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn-icon btn-sm"
                          style={{ width: 26, height: 26 }}
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 18, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn-icon btn-sm"
                          style={{ width: 26, height: 26 }}
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="btn-ghost btn-sm"
                          style={{ color: 'var(--accent-rose)', padding: '0.2rem' }}
                          onClick={() => removeFromCart(item.product.id)}
                          title={t('delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>{t('deliveryAddress')}</label>
                    {isAuthenticated && (
                      <button 
                        className="btn-ghost btn-sm" 
                        style={{ color: 'var(--primary)', fontSize: '0.8rem', padding: 0 }}
                        onClick={() => setIsAddressModalOpen(true)}
                      >
                        {t('addNewAddress')}
                      </button>
                    )}
                  </div>

                  {!isAuthenticated ? (
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}>
                      {t('loginToSelectAddress')}
                    </div>
                  ) : addresses.length === 0 ? (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => setIsAddressModalOpen(true)}
                    >
                      {t('addAddressNow')}
                    </button>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedAddressId || ''}
                      onChange={e => setSelectedAddressId(Number(e.target.value))}
                    >
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label || addr.title}: {addr.city}, {addr.addressLine || addr.street} {addr.buildingNumber ? `(${t('building')} ${addr.buildingNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Order Notes */}
                <div className="form-group">
                  <label className="form-label">{t('orderNotesLabel')}</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder={t('orderNotesPlaceholder')}
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                  ></textarea>
                </div>
              </>
            )}
          </div>

          {/* Footer with Totals & Checkout Button */}
          {cart.items.length > 0 && (
            <div className="drawer-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                <span>{t('itemsSubtotal')}</span>
                <span>{subtotal.toFixed(2)} {t('currency')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>{t('deliveryFee')}:</span>
                <span>{cart.deliveryFee.toFixed(2)} {t('currency')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                paddingTop: '0.5rem',
                borderTop: '1px dashed var(--border-subtle)',
                marginBottom: '1rem'
              }}>
                <span>{t('totalAmount')}</span>
                <span style={{ color: 'var(--primary)' }}>{totalAmount.toFixed(2)} {t('currency')}</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? t('submittingOrder') : t('confirmOrderBtn')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressAdded={fetchAddresses}
      />
    </>
  );
}
