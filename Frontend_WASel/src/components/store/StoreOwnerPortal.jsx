import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import { orderApi } from '../../api/orderApi';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

export default function StoreOwnerPortal({ activeTab = 'store-orders', setActiveTab }) {
  const { showToast } = useNotifications();
  const { t } = useAuth();
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('NEW'); // 'NEW' | 'PREPARING' | 'READY' | 'DONE'

  // Determine current tab from props or fallback
  const currentTab = (activeTab === 'store-orders' || activeTab === 'orders') 
    ? 'orders' 
    : (activeTab === 'store-menu' || activeTab === 'menu') 
      ? 'menu' 
      : 'settings';

  const switchTab = (tabKey) => {
    if (setActiveTab) {
      if (tabKey === 'orders') setActiveTab('store-orders');
      else if (tabKey === 'menu') setActiveTab('store-menu');
      else setActiveTab('store-info');
    }
  };

  // Modals
  const [isNewStoreModal, setIsNewStoreModal] = useState(false);
  const [isProductModal, setIsProductModal] = useState(false);
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Forms
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    deliveryFee: 15,
  });

  const [editStoreForm, setEditStoreForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    deliveryFee: 15,
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isAvailable: true,
  });

  const [categoryName, setCategoryName] = useState('');

  const openNewStore = () => {
    setNewStoreForm({ name: '', description: '', phone: '', address: '', deliveryFee: 15 });
    setIsNewStoreModal(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', categoryId: '', isAvailable: true });
    setIsProductModal(true);
  };

  const openNewCategory = () => {
    setCategoryName('');
    setIsCategoryModal(true);
  };

  // 1. Fetch My Stores
  const fetchMyStores = async () => {
    setLoading(true);
    try {
      const list = await storeApi.getMyStores();
      setStores(list || []);
      if (list && list.length > 0) {
        const found = list.find(s => s.id === activeStore?.id) || list[0];
        setActiveStore(found);
        setEditStoreForm({
          name: found.name || '',
          description: found.description || '',
          phone: found.phone || '',
          address: found.address || '',
          deliveryFee: found.deliveryFee || 15,
        });
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading stores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStores();
  }, []);

  // Sync editStoreForm when activeStore changes
  useEffect(() => {
    if (activeStore) {
      setEditStoreForm({
        name: activeStore.name || '',
        description: activeStore.description || '',
        phone: activeStore.phone || '',
        address: activeStore.address || '',
        deliveryFee: activeStore.deliveryFee || 15,
      });
    }
  }, [activeStore]);

  // 2. Fetch Active Store Orders & Products
  const fetchStoreDetails = async () => {
    if (!activeStore) return;
    try {
      const [ordersList, prodsList, catsList] = await Promise.all([
        orderApi.getStoreOrders(activeStore.id).catch(() => []),
        storeApi.getProducts(activeStore.id).catch(() => []),
        storeApi.getCategories(activeStore.id).catch(() => []),
      ]);
      setOrders(ordersList || []);
      setProducts(prodsList || []);
      setCategories(catsList || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeStore) {
      fetchStoreDetails();
    }
  }, [activeStore?.id]);

  // Store Actions
  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      const created = await storeApi.createStore(newStoreForm);
      showToast(`${t('storeCreatedSuccess')} (${created.name})`, 'success');
      setIsNewStoreModal(false);
      fetchMyStores();
    } catch (err) {
      showToast(err.message || 'Failed to create store', 'error');
    }
  };

  const handleUpdateStoreSettings = async (e) => {
    e.preventDefault();
    if (!activeStore) return;
    try {
      await storeApi.updateStore(activeStore.id, editStoreForm);
      showToast(t('storeSettingsSaved'), 'success');
      fetchMyStores();
    } catch (err) {
      showToast(err.message || 'Failed to update store settings', 'error');
    }
  };

  const handleToggleStoreStatus = async () => {
    if (!activeStore) return;
    const newStatus = activeStore.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await storeApi.updateStatus(activeStore.id, newStatus);
      showToast(`${t('storeStatusChanged')} ${newStatus === 'OPEN' ? t('badgeOpen') : t('badgeClosed')}`, 'success');
      setActiveStore(prev => ({ ...prev, status: newStatus }));
      fetchMyStores();
    } catch (err) {
      showToast(err.message || 'Failed to update store status', 'error');
    }
  };

  // Order Actions
  const handleAcceptOrder = async (orderId) => {
    try {
      await orderApi.acceptOrder(orderId);
      showToast(t('orderAcceptedSuccess'), 'success');
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to accept order', 'error');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt(t('rejectPromptTitle'), t('rejectPromptDefault'));
    if (!reason) return;
    try {
      await orderApi.rejectOrder(orderId, reason);
      showToast(t('orderRejectedInfo'), 'info');
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to reject order', 'error');
    }
  };

  const handlePrepareOrder = async (orderId) => {
    try {
      await orderApi.startPreparing(orderId);
      showToast(t('orderPreparingSuccess'), 'success');
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await orderApi.markReady(orderId);
      showToast(t('orderReadySuccess'), 'success');
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Product Actions
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
      };
      if (editingProduct?.id) {
        await storeApi.updateProduct(activeStore.id, editingProduct.id, payload);
        showToast(t('productSavedSuccess'), 'success');
      } else {
        await storeApi.createProduct(activeStore.id, payload);
        showToast(t('productAddedSuccess'), 'success');
      }
      setIsProductModal(false);
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleToggleProduct = async (productId) => {
    try {
      await storeApi.toggleAvailability(activeStore.id, productId);
      showToast(t('productAvailabilityToggled'), 'success');
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to update product availability', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t('deleteProductConfirm'))) return;
    try {
      await storeApi.deleteProduct(activeStore.id, productId);
      showToast(t('productDeletedSuccess'), 'success');
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await storeApi.createCategory(activeStore.id, { name: categoryName, displayOrder: categories.length + 1 });
      showToast(t('categoryAddedSuccess'), 'success');
      setCategoryName('');
      setIsCategoryModal(false);
      fetchStoreDetails();
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'NEW') return o.status === 'PENDING';
    if (orderFilter === 'PREPARING') return o.status === 'ACCEPTED' || o.status === 'PREPARING';
    if (orderFilter === 'READY') return o.status === 'READY' || o.status === 'ASSIGNED' || o.status === 'PICKED_UP' || o.status === 'ON_THE_WAY';
    if (orderFilter === 'DONE') return o.status === 'DELIVERED' || o.status === 'CANCELLED' || o.status === 'REJECTED';
    return true;
  });

  return (
    <div>
      {/* Top Store Header / Switcher */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🏪</div>
            <div>
              {stores.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <select
                    className="form-select"
                    style={{ fontWeight: 800, fontSize: '1.15rem', padding: '0.4rem 0.8rem' }}
                    value={activeStore?.id || ''}
                    onChange={(e) => {
                      const sel = stores.find(s => s.id === Number(e.target.value));
                      if (sel) setActiveStore(sel);
                    }}
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {activeStore && <Badge status={activeStore.status} />}
                </div>
              ) : (
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('storeOwnerDashboard')}</h3>
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeStore ? `📍 ${activeStore.address || 'Address'} • ${t('deliveryFee')}: ${activeStore.deliveryFee} ${t('currency')}` : t('noStoreRegistered')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {activeStore && (
              <button
                className={`btn ${activeStore.status === 'OPEN' ? 'btn-outline' : 'btn-primary'} btn-sm`}
                onClick={handleToggleStoreStatus}
              >
                {activeStore.status === 'OPEN' ? t('closeStoreBtn') : t('openStoreBtn')}
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={openNewStore}
            >
              {t('createNewStoreBtn')}
            </button>
          </div>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏬</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('noStoreRegistered')}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            {t('noStoreRegisteredHint')}
          </p>
          <button className="btn btn-primary btn-lg" onClick={openNewStore}>
            {t('createFirstStoreBtn')}
          </button>
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              className={`btn ${currentTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => switchTab('orders')}
            >
              {t('incomingOrdersTab')} ({orders.length})
            </button>
            <button
              className={`btn ${currentTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => switchTab('menu')}
            >
              {t('menuTab')} ({products.length})
            </button>
            <button
              className={`btn ${currentTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => switchTab('settings')}
            >
              ⚙️ {t('navStoreSettings')}
            </button>
          </div>

          {/* TAB 1: Orders Board */}
          {currentTab === 'orders' && (
            <div>
              {/* Order Status Filters */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  className={`btn btn-sm ${orderFilter === 'NEW' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOrderFilter('NEW')}
                >
                  {t('filterNewOrders')} ({orders.filter(o => o.status === 'PENDING').length})
                </button>
                <button
                  className={`btn btn-sm ${orderFilter === 'PREPARING' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOrderFilter('PREPARING')}
                >
                  {t('filterPreparing')} ({orders.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING').length})
                </button>
                <button
                  className={`btn btn-sm ${orderFilter === 'READY' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOrderFilter('READY')}
                >
                  {t('filterReadyOrders')} ({orders.filter(o => ['READY', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(o.status)).length})
                </button>
                <button
                  className={`btn btn-sm ${orderFilter === 'DONE' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOrderFilter('DONE')}
                >
                  {t('filterDoneOrders')} ({orders.filter(o => ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length})
                </button>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                  <h4>{t('noOrdersInTab')}</h4>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredOrders.map(order => (
                    <div key={order.id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                            <strong style={{ fontSize: '1.1rem' }}>{t('orderNumber')}{order.orderNumber || order.id}</strong>
                            <Badge status={order.status} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {t('tableCustomer')}: <strong>{order.customerName}</strong> • {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div style={{ textAlign: 'end' }}>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--primary-dark)' }}>{order.totalAmount} {t('currency')}</strong>
                        </div>
                      </div>

                      {/* Store Actions per status */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.6rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)'
                      }}>
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
                              onClick={() => handleRejectOrder(order.id)}
                            >
                              {t('rejectOrderBtn')}
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              {t('acceptOrderBtn')}
                            </button>
                          </>
                        )}

                        {order.status === 'ACCEPTED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePrepareOrder(order.id)}
                          >
                            {t('startPreparingBtn')}
                          </button>
                        )}

                        {order.status === 'PREPARING' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ background: 'var(--secondary-gradient)' }}
                            onClick={() => handleMarkReady(order.id)}
                          >
                            {t('markReadyBtn')}
                          </button>
                        )}

                        {['READY', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(order.status) && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {t('inDeliveryProgress')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Menu & Products */}
          {currentTab === 'menu' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={openNewProduct}
                  >
                    {t('addProductBtn')}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={openNewCategory}
                  >
                    {t('addCategoryBtn')}
                  </button>
                </div>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t('totalProducts')}: {products.length} | {t('totalCategories')}: {categories.length}
                </span>
              </div>

              {products.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍔</div>
                  <h4>{t('emptyMenu')}</h4>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('emptyMenuHint')}</p>
                  <button className="btn btn-primary btn-sm" onClick={openNewProduct}>
                    {t('addFirstProduct')}
                  </button>
                </div>
              ) : (
                <div className="grid-products">
                  {products.map(prod => (
                    <div key={prod.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{prod.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {categories.find(c => c.id === prod.categoryId)?.name || t('noCategory')}
                          </span>
                        </div>
                        <strong style={{ color: 'var(--primary-dark)', fontSize: '1.1rem' }}>
                          {prod.price} {t('currency')}
                        </strong>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '0.75rem' }}>
                        {prod.description || ''}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)'
                      }}>
                        <button
                          className={`btn ${prod.isAvailable ? 'btn-outline' : 'btn-primary'} btn-sm`}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => handleToggleProduct(prod.id)}
                        >
                          {prod.isAvailable ? `🟢 ${t('available')}` : `🔴 ${t('notAvailable')}`}
                        </button>

                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            className="btn-icon btn-sm"
                            style={{ width: 28, height: 28 }}
                            title={t('edit')}
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm({
                                name: prod.name,
                                description: prod.description || '',
                                price: prod.price,
                                categoryId: prod.categoryId || '',
                                isAvailable: prod.isAvailable,
                              });
                              setIsProductModal(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-sm"
                            style={{ width: 28, height: 28, color: 'var(--accent-rose)' }}
                            title={t('delete')}
                            onClick={() => handleDeleteProduct(prod.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Store Settings & Profile */}
          {currentTab === 'settings' && activeStore && (
            <div className="card" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>⚙️ {t('storeSettingsTitle')}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {t('storeSettingsDesc')}
                  </p>
                </div>
                <Badge status={activeStore.status} />
              </div>

              <form onSubmit={handleUpdateStoreSettings}>
                <div className="form-group">
                  <label className="form-label">{t('storeName')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editStoreForm.name}
                    placeholder={t('storeNamePlaceholder')}
                    onChange={e => setEditStoreForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('storeDesc')}</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={editStoreForm.description}
                    placeholder={t('storeDescPlaceholder')}
                    onChange={e => setEditStoreForm(p => ({ ...p, description: e.target.value }))}
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('phone')}</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={editStoreForm.phone}
                      placeholder={t('phonePlaceholder')}
                      onChange={e => setEditStoreForm(p => ({ ...p, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('deliveryFee')} ({t('currency')})</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={editStoreForm.deliveryFee}
                      onChange={e => setEditStoreForm(p => ({ ...p, deliveryFee: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('storeLocation')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editStoreForm.address}
                    placeholder={t('storeLocationPlaceholder')}
                    onChange={e => setEditStoreForm(p => ({ ...p, address: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {t('saveStoreSettingsBtn')}
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeStore.status === 'OPEN' ? 'btn-outline' : 'btn-primary'}`}
                    onClick={handleToggleStoreStatus}
                  >
                    {activeStore.status === 'OPEN' ? t('closeStoreBtn') : t('openStoreBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Modal: Create Store */}
      <Modal isOpen={isNewStoreModal} onClose={() => setIsNewStoreModal(false)} title={`🏪 ${t('createNewStoreBtn')}`}>
        <form onSubmit={handleCreateStore}>
          <div className="form-group">
            <label className="form-label">{t('storeName')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('storeNamePlaceholder')}
              value={newStoreForm.name}
              onChange={e => setNewStoreForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('storeDesc')}</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder={t('storeDescPlaceholder')}
              value={newStoreForm.description}
              onChange={e => setNewStoreForm(p => ({ ...p, description: e.target.value }))}
            ></textarea>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">{t('phone')}</label>
              <input
                type="tel"
                className="form-input"
                placeholder={t('phonePlaceholder')}
                value={newStoreForm.phone}
                onChange={e => setNewStoreForm(p => ({ ...p, phone: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('deliveryFee')} ({t('currency')})</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={newStoreForm.deliveryFee}
                onChange={e => setNewStoreForm(p => ({ ...p, deliveryFee: Number(e.target.value) }))}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('storeLocation')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('storeLocationPlaceholder')}
              value={newStoreForm.address}
              onChange={e => setNewStoreForm(p => ({ ...p, address: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {t('createStoreSubmit')}
          </button>
        </form>
      </Modal>

      {/* Modal: Create / Edit Product */}
      <Modal
        isOpen={isProductModal}
        onClose={() => setIsProductModal(false)}
        title={editingProduct ? `✏️ ${t('saveProductBtn')}` : `🍔 ${t('addProductBtn')}`}
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label className="form-label">{t('productName')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('productNamePlaceholder')}
              value={productForm.name}
              onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('productDesc')}</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder={t('productDescPlaceholder')}
              value={productForm.description}
              onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
            ></textarea>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">{t('productPrice')} ({t('currency')})</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                className="form-input"
                value={productForm.price}
                onChange={e => setProductForm(p => ({ ...p, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('productCategory')}</label>
              <select
                className="form-select"
                value={productForm.categoryId || ''}
                onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">{t('noCategory')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {editingProduct ? t('saveProductBtn') : t('createProductBtn')}
          </button>
        </form>
      </Modal>

      {/* Modal: Create Category */}
      <Modal isOpen={isCategoryModal} onClose={() => setIsCategoryModal(false)} title={`📁 ${t('addCategoryBtn')}`}>
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <label className="form-label">{t('categoryName')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('categoryNamePlaceholder')}
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {t('saveCategoryBtn')}
          </button>
        </form>
      </Modal>
    </div>
  );
}
