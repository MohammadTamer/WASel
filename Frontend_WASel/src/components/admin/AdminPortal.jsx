import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function AdminPortal({ activeTab = 'admin-dashboard', setActiveTab }) {
  const { showToast } = useNotifications();
  const { t } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentTab = (activeTab === 'admin-dashboard' || activeTab === 'overview') 
    ? 'overview' 
    : (activeTab === 'admin-stores' || activeTab === 'stores') 
      ? 'stores' 
      : (activeTab === 'admin-users' || activeTab === 'users') 
        ? 'users' 
        : 'orders';

  const switchTab = (tabKey) => {
    if (setActiveTab) {
      if (tabKey === 'overview') setActiveTab('admin-dashboard');
      else if (tabKey === 'stores') setActiveTab('admin-stores');
      else if (tabKey === 'users') setActiveTab('admin-users');
      else setActiveTab('admin-orders');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dash, strList, custList, drvList, ordList] = await Promise.all([
        adminApi.getDashboard().catch(() => null),
        adminApi.getStores().catch(() => []),
        adminApi.getCustomers().catch(() => []),
        adminApi.getDrivers().catch(() => []),
        adminApi.getOrders().catch(() => []),
      ]);
      setDashboard(dash);
      setStores(strList || []);
      setCustomers(custList || []);
      setDrivers(drvList || []);
      setOrders(ordList || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleActive = async (userId) => {
    try {
      const updatedUser = await adminApi.toggleUserActive(userId);
      showToast(`${t('userStatusUpdated')} (${updatedUser.name}: ${updatedUser.isActive ? t('accountActive') : t('accountDisabled')})`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{t('adminDashboardTitle')}</h2>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('adminDashboardSubtitle')}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchAdminData}>
          {t('refreshAdmin')}
        </button>
      </div>

      {/* KPI Dashboard Cards */}
      <div className="grid-dashboard">
        <div className="card" style={{ borderInlineStart: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>{t('kpiCustomers')}</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
            {dashboard?.totalCustomers ?? customers.length} 👥
          </div>
        </div>

        <div className="card" style={{ borderInlineStart: '4px solid var(--secondary)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>{t('kpiStores')}</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--secondary)', marginTop: '0.2rem' }}>
            {dashboard?.totalStores ?? stores.length} 🏪
          </div>
        </div>

        <div className="card" style={{ borderInlineStart: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>{t('kpiDrivers')}</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
            {dashboard?.totalDrivers ?? drivers.length} 🛵
          </div>
        </div>

        <div className="card" style={{ borderInlineStart: '4px solid var(--accent-blue)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>{t('kpiActiveOrders')}</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
            {dashboard?.activeOrders ?? orders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length} ⏳
          </div>
        </div>

        <div className="card" style={{ borderInlineStart: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>{t('kpiCompletedOrders')}</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '0.2rem' }}>
            {dashboard?.completedOrders ?? orders.filter(o => o.status === 'DELIVERED').length} 🎉
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0' }}>
        <button
          className={`btn ${currentTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('overview')}
        >
          {t('adminOverviewTab')}
        </button>
        <button
          className={`btn ${currentTab === 'stores' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('stores')}
        >
          {t('adminStoresTab')} ({stores.length})
        </button>
        <button
          className={`btn ${currentTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('users')}
        >
          {t('adminUsersTab')} ({customers.length + drivers.length})
        </button>
        <button
          className={`btn ${currentTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('orders')}
        >
          {t('adminOrdersTab')} ({orders.length})
        </button>
      </div>

      {/* TAB 1: Overview */}
      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('recentOrdersWidget')}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => switchTab('orders')}>
                {t('viewAll')}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'start' }}>
                    <th style={{ padding: '0.75rem' }}>{t('tableOrderNum')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableStore')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableCustomer')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableAmount')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableStatus')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>#{o.orderNumber || o.id}</td>
                      <td style={{ padding: '0.75rem' }}>{o.storeName}</td>
                      <td style={{ padding: '0.75rem' }}>{o.customerName}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 800 }}>{o.totalAmount} {t('currency')}</td>
                      <td style={{ padding: '0.75rem' }}><Badge status={o.status} /></td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {new Date(o.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Stores */}
      {currentTab === 'stores' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>{t('storesTableTitle')}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'start' }}>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableStore')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableRating')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tablePhone')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableAddress')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableFee')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem' }}>{s.id}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{s.name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--accent-amber)', fontWeight: 700 }}>⭐ {s.rating || 5.0}</td>
                    <td style={{ padding: '0.75rem' }}>{s.phone}</td>
                    <td style={{ padding: '0.75rem' }}>{s.address}</td>
                    <td style={{ padding: '0.75rem' }}>{s.deliveryFee} {t('currency')}</td>
                    <td style={{ padding: '0.75rem' }}><Badge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Users Moderation */}
      {currentTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customers Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>{t('customerListTitle')}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'start' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableName')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableEmail')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tablePhone')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableStatus')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem' }}>{u.id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{u.name}</td>
                      <td style={{ padding: '0.75rem' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem' }}>{u.phone}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                          {u.isActive ? t('accountActive') : t('accountDisabled')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          className={`btn ${u.isActive ? 'btn-outline' : 'btn-primary'} btn-sm`}
                          style={u.isActive ? { color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' } : {}}
                          onClick={() => handleToggleActive(u.id)}
                        >
                          {u.isActive ? t('disableAccount') : t('enableAccount')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>{t('driverListTitle')}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'start' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableName')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableEmail')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tablePhone')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableRating')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableStatus')}</th>
                    <th style={{ padding: '0.75rem' }}>{t('tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem' }}>{d.id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{d.name}</td>
                      <td style={{ padding: '0.75rem' }}>{d.email}</td>
                      <td style={{ padding: '0.75rem' }}>{d.phone}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--accent-amber)', fontWeight: 700 }}>⭐ {d.rating || 5.0}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${d.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                          {d.isActive ? t('accountActive') : t('accountDisabled')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          className={`btn ${d.isActive ? 'btn-outline' : 'btn-primary'} btn-sm`}
                          style={d.isActive ? { color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' } : {}}
                          onClick={() => handleToggleActive(d.id)}
                        >
                          {d.isActive ? t('disableAccount') : t('enableAccount')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: All Orders */}
      {currentTab === 'orders' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>{t('allOrdersTableTitle')}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'start' }}>
                  <th style={{ padding: '0.75rem' }}>{t('tableOrderNum')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableStore')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableCustomer')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableAmount')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableStatus')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('tableTime')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>#{o.orderNumber || o.id}</td>
                    <td style={{ padding: '0.75rem' }}>{o.storeName}</td>
                    <td style={{ padding: '0.75rem' }}>{o.customerName}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 800 }}>{o.totalAmount} {t('currency')}</td>
                    <td style={{ padding: '0.75rem' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
