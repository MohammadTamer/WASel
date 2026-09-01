import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../../api/deliveryApi';
import { userApi } from '../../api/services';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import StatusTracker from '../common/StatusTracker';

export default function DriverPortal({ activeTab = 'driver-available', setActiveTab }) {
  const { showToast } = useNotifications();
  const { t } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentTab = (activeTab === 'driver-available' || activeTab === 'available') 
    ? 'available' 
    : (activeTab === 'driver-active' || activeTab === 'active') 
      ? 'active' 
      : 'history';

  const switchTab = (tabKey) => {
    if (setActiveTab) {
      if (tabKey === 'available') setActiveTab('driver-available');
      else if (tabKey === 'active') setActiveTab('driver-active');
      else setActiveTab('driver-history');
    }
  };

  const fetchDriverData = async () => {
    try {
      const [profData, availList, myList] = await Promise.all([
        userApi.getDriverProfile().catch(() => null),
        deliveryApi.getAvailableDeliveries().catch(() => []),
        deliveryApi.getMyDeliveries().catch(() => []),
      ]);
      setProfile(profData);
      setAvailableDeliveries(availList || []);
      setMyDeliveries(myList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 5000); // 5s live radar
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async () => {
    const newStatus = profile?.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    try {
      await userApi.updateDriverStatus(newStatus);
      setProfile(prev => ({ ...prev, status: newStatus }));
      showToast(`${t('driverStatusChanged')} ${newStatus === 'AVAILABLE' ? t('badgeAvailable') : t('badgeBusy')}`, 'success');
      fetchDriverData();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Driver Workflow Actions
  const handleAcceptDelivery = async (deliveryId) => {
    if (!deliveryId) {
      showToast(t('invalidDeliveryId'), 'error');
      return;
    }
    try {
      await deliveryApi.acceptDelivery(deliveryId);
      showToast(t('deliveryAcceptedSuccess'), 'success');
      switchTab('active');
      fetchDriverData();
    } catch (err) {
      showToast(err.message || 'Failed to accept delivery', 'error');
    }
  };

  const handlePickup = async (deliveryId) => {
    try {
      await deliveryApi.pickupDelivery(deliveryId);
      showToast(t('deliveryPickedUpSuccess'), 'success');
      fetchDriverData();
    } catch (err) {
      showToast(err.message || 'Failed to confirm pickup', 'error');
    }
  };

  const handleStartDelivery = async (deliveryId) => {
    try {
      await deliveryApi.startDelivery(deliveryId);
      showToast(t('deliveryOnWaySuccess'), 'success');
      fetchDriverData();
    } catch (err) {
      showToast(err.message || 'Failed to update delivery status', 'error');
    }
  };

  const handleCompleteDelivery = async (deliveryId) => {
    try {
      await deliveryApi.completeDelivery(deliveryId);
      showToast(t('deliveryCompletedSuccess'), 'success');
      fetchDriverData();
    } catch (err) {
      showToast(err.message || 'Failed to complete delivery', 'error');
    }
  };

  // Find currently active delivery (Assigned / Picked Up / On the way)
  const activeDelivery = myDeliveries.find(d => 
    ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(d.status || d.orderStatus)
  );

  return (
    <div>
      {/* Driver Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 56,
              height: 56,
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              color: 'white'
            }}>
              🛵
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {t('driverTitle')} {profile?.name || 'WASel Driver'}
                </h2>
                <Badge status={profile?.status || 'AVAILABLE'} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>⭐ {t('storeRating')}: <strong style={{ color: 'var(--accent-amber)' }}>{profile?.rating ? profile.rating.toFixed(1) : '5.0'}</strong></span>
                <span>📦 {t('completedDeliveries')} <strong>{myDeliveries.filter(d => (d.status || d.orderStatus) === 'DELIVERED').length}</strong></span>
              </div>
            </div>
          </div>

          <button
            className={`btn ${profile?.status === 'AVAILABLE' ? 'btn-outline' : 'btn-primary'}`}
            onClick={handleToggleStatus}
          >
            {profile?.status === 'AVAILABLE' ? t('switchToBusy') : t('switchToAvailable')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${currentTab === 'available' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('available')}
        >
          {t('availableRadarTab')} ({availableDeliveries.length})
        </button>
        <button
          className={`btn ${currentTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('active')}
        >
          {t('activeDeliveryTab')} {activeDelivery && '🔴'}
        </button>
        <button
          className={`btn ${currentTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchTab('history')}
        >
          {t('deliveryHistoryTab')} ({myDeliveries.length})
        </button>
      </div>

      {/* TAB 1: Available Deliveries Radar */}
      {currentTab === 'available' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('radarHeading')}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('autoUpdate7s')}</span>
          </div>

          {availableDeliveries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📡</div>
              <h4>{t('noAvailableRadar')}</h4>
              <p style={{ fontSize: '0.85rem' }}>{t('noAvailableRadarHint')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {availableDeliveries.map(del => {
                const deliveryId = del.deliveryId || del.id;
                return (
                  <div key={deliveryId} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block' }}>{t('orderNumber')}{del.orderNumber}</strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {t('readySince')} {new Date(del.readyAt || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <span style={{
                        background: 'var(--primary-light)',
                        color: 'var(--primary-dark)',
                        fontWeight: 900,
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.9rem'
                      }}>
                        +{del.deliveryFee} {t('currency')} {t('earningsBadge')}
                      </span>
                    </div>

                    {/* Route Info */}
                    <div style={{
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      marginBottom: '1rem',
                      flex: 1
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{t('pickupLocation')}</span>
                        <p style={{ margin: 0, fontWeight: 600 }}>{del.storeName} ({del.storeAddress || 'Store Location'})</p>
                      </div>
                      <div>
                        <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{t('dropoffLocation')}</span>
                        <p style={{ margin: 0, fontWeight: 600 }}>{del.customerArea || del.customerAddress || 'Customer Area'}</p>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => handleAcceptDelivery(deliveryId)}
                    >
                      {t('acceptDeliveryBtn')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Active Delivery Workflow */}
      {currentTab === 'active' && (
        <div>
          {!activeDelivery ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛵</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('noActiveDelivery')}</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('noActiveDeliveryHint')}</p>
              <button className="btn btn-primary" onClick={() => switchTab('available')}>
                {t('goToRadar')}
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {t('currentDeliveryMission')} {activeDelivery.orderNumber}
                  </h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {activeDelivery.storeName} ➔ {activeDelivery.customerName || activeDelivery.customerAddress}
                  </span>
                </div>
                <Badge status={activeDelivery.status || activeDelivery.orderStatus} />
              </div>

              {/* Status Tracker */}
              <div style={{ marginBottom: '2rem' }}>
                <StatusTracker status={activeDelivery.status || activeDelivery.orderStatus} />
              </div>

              {/* Destination Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>{t('pickupLocation')}</strong>
                  <p style={{ margin: 0, fontWeight: 700 }}>{activeDelivery.storeName}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeDelivery.storeAddress}</p>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '0.4rem' }}>{t('dropoffLocation')}</strong>
                  <p style={{ margin: 0, fontWeight: 700 }}>{activeDelivery.customerName || 'Customer'}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeDelivery.customerAddress}</p>
                </div>
              </div>

              {/* Step Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(activeDelivery.status || activeDelivery.orderStatus) === 'ASSIGNED' && (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={() => handlePickup(activeDelivery.id || activeDelivery.deliveryId)}
                  >
                    {t('driverStep1Pickup')}
                  </button>
                )}

                {(activeDelivery.status || activeDelivery.orderStatus) === 'PICKED_UP' && (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={() => handleStartDelivery(activeDelivery.id || activeDelivery.deliveryId)}
                  >
                    {t('driverStep2OnWay')}
                  </button>
                )}

                {(activeDelivery.status || activeDelivery.orderStatus) === 'ON_THE_WAY' && (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', background: 'var(--secondary-gradient)' }}
                    onClick={() => handleCompleteDelivery(activeDelivery.id || activeDelivery.deliveryId)}
                  >
                    {t('driverStep3Deliver')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: History */}
      {currentTab === 'history' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>{t('deliveryHistoryTitle')}</h3>
          {myDeliveries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p>{t('noDeliveryHistory')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myDeliveries.map(del => (
                <div key={del.id || del.deliveryId} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>{t('orderNumber')}{del.orderNumber}</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>
                      {del.storeName} ➔ {del.customerName || del.customerAddress}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>+{del.deliveryFee != null ? del.deliveryFee : 0} {t('currency')}</span>
                    <Badge status={del.status || del.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
