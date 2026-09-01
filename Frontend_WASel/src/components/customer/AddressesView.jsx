import React, { useState, useEffect } from 'react';
import { addressApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import AddressModal from '../auth/AddressModal';

export default function AddressesView() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { t } = useAuth();
  const { showToast } = useNotifications();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const list = await addressApi.getMyAddresses();
      setAddresses(list || []);
    } catch (err) {
      console.error(err);
      showToast(t('addressLoadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await addressApi.deleteAddress(id);
      showToast(t('addressDeletedSuccess'), 'info');
      fetchAddresses();
    } catch (err) {
      showToast(err.message || t('addressDeleteError'), 'error');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('addressesTitle')}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {t('addressesSubtitle')}
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
          {t('addNewAddressBtn')}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>{t('loadingOrders')}</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📍</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('noAddressesYet')}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {t('noAddressesHint')}
          </p>
          <button className="btn btn-primary" onClick={handleAddNew}>
            {t('addFirstAddress')}
          </button>
        </div>
      ) : (
        <div className="grid-stores">
          {addresses.map(addr => (
            <div key={addr.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📍 {addr.label || addr.title}
                  </strong>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  {addr.city}، {addr.addressLine || addr.street}
                  {addr.buildingNumber && ` • ${t('building')}: ${addr.buildingNumber}`}
                  {(addr.floor || addr.floorNumber) && ` • ${t('floor')}: ${addr.floor || addr.floorNumber}`}
                  {(addr.apartment || addr.apartmentNumber) && ` • ${t('apartment')}: ${addr.apartment || addr.apartmentNumber}`}
                </p>

                {addr.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    💡 {addr.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(addr)}>
                  ✏️ {t('edit')}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-rose)' }} onClick={() => handleDelete(addr.id)}>
                  🗑️ {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddressAdded={fetchAddresses}
        initialData={editingAddress}
      />
    </div>
  );
}
