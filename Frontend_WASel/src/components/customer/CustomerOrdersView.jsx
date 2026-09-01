import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../common/Badge';
import StatusTracker from '../common/StatusTracker';
import ReviewModal from './ReviewModal';

export default function CustomerOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);

  const { t } = useAuth();
  const { addToCart, clearCart, setIsDrawerOpen } = useCart();
  const { showToast } = useNotifications();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const list = await orderApi.getMyOrders();
      setOrders(list || []);
    } catch (err) {
      console.error(err);
      showToast(t('loadingOrders'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt(t('cancelReasonPrompt'), t('cancelReasonDefault'));
    if (!reason) return;
    try {
      await orderApi.cancelOrder(orderId, reason);
      showToast(t('orderCancelledSuccess'), 'info');
      fetchOrders();
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    clearCart();
    order.items.forEach(item => {
      addToCart(
        { id: item.productId, name: item.productName, price: item.price },
        { id: order.storeId, name: order.storeName, deliveryFee: order.deliveryFee != null ? order.deliveryFee : 0 }
      );
    });
    setIsDrawerOpen(true);
    showToast(t('itemAddedToCart'), 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('ordersPageTitle')}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {t('ordersPageSubtitle')}
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
          {t('refreshLive')}
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>{t('loadingOrders')}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('noOrdersYet')}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {t('noOrdersHint')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const isTerminal = ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(order.status);

            return (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {t('orderNumber')}{order.orderNumber || order.id}
                      </h3>
                      <Badge status={order.status} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      🏪 {order.storeName || 'Store'} • {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <strong style={{ fontSize: '1.3rem', color: 'var(--primary-dark)' }}>
                      {order.totalAmount} {t('currency')}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {order.items?.length || 0} {t('itemsCount')}
                    </span>
                  </div>
                </div>

                {/* 8-Step Timeline */}
                <div style={{ margin: '1.25rem 0' }}>
                  <StatusTracker status={order.status} />
                </div>

                {/* Items Summary */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  marginBottom: '1rem'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>{t('orderedItems')}</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {order.items?.map((item, idx) => (
                      <span key={idx} style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem'
                      }}>
                        {item.productName} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  {order.status === 'PENDING' && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      {t('cancelOrder')}
                    </button>
                  )}

                  {order.status === 'DELIVERED' && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--secondary-gradient)' }}
                      onClick={() => setReviewOrder(order)}
                    >
                      {t('rateOrder')}
                    </button>
                  )}

                  {isTerminal && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleReorder(order)}
                    >
                      {t('reorderBtn')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          order={reviewOrder}
          onReviewed={fetchOrders}
        />
      )}
    </div>
  );
}
