import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { addressApi } from '../../api/services';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function AddressModal({ isOpen, onClose, onAddressAdded, initialData }) {
  const { showToast } = useNotifications();
  const { t } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: t('addressDefaultLabel'),
    addressLine: '',
    city: '',
    buildingNumber: '',
    floor: '',
    apartment: '',
    notes: '',
  });

  // Reset form whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          label: initialData.label || initialData.title || t('addressDefaultLabel'),
          addressLine: initialData.addressLine || initialData.street || '',
          city: initialData.city || '',
          buildingNumber: initialData.buildingNumber || '',
          floor: initialData.floor || initialData.floorNumber || '',
          apartment: initialData.apartment || initialData.apartmentNumber || '',
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          label: t('addressDefaultLabel'),
          addressLine: '',
          city: '',
          buildingNumber: '',
          floor: '',
          apartment: '',
          notes: '',
        });
      }
      setLoading(false);
    }
  }, [isOpen, initialData, t]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        label: formData.label.trim(),
        addressLine: formData.addressLine.trim(),
        city: formData.city.trim(),
        buildingNumber: formData.buildingNumber ? formData.buildingNumber.trim() : null,
        floor: formData.floor ? formData.floor.trim() : null,
        apartment: formData.apartment ? formData.apartment.trim() : null,
        notes: formData.notes ? formData.notes.trim() : null,
      };

      if (initialData?.id) {
        await addressApi.updateAddress(initialData.id, payload);
        showToast(t('addressUpdatedSuccess'), 'success');
      } else {
        await addressApi.createAddress(payload);
        showToast(t('addressAddedSuccess'), 'success');
      }
      onAddressAdded();
      onClose();
    } catch (err) {
      showToast(err.message || t('addressSaveError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `✏️ ${t('edit')} ${t('deliveryAddress')}` : `📍 ${t('addNewAddressBtn')}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('addressLabel')}</label>
          <input
            type="text"
            name="label"
            className="form-input"
            placeholder={t('addressLabelPlaceholder')}
            value={formData.label}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">{t('city')}</label>
            <input
              type="text"
              name="city"
              className="form-input"
              placeholder={t('cityPlaceholder')}
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('addressLine')}</label>
            <input
              type="text"
              name="addressLine"
              className="form-input"
              placeholder={t('addressLinePlaceholder')}
              value={formData.addressLine}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          <div className="form-group">
            <label className="form-label">{t('building')}</label>
            <input
              type="text"
              name="buildingNumber"
              className="form-input"
              placeholder={t('buildingPlaceholder')}
              value={formData.buildingNumber || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('floor')}</label>
            <input
              type="text"
              name="floor"
              className="form-input"
              placeholder={t('floorPlaceholder')}
              value={formData.floor || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('apartment')}</label>
            <input
              type="text"
              name="apartment"
              className="form-input"
              placeholder={t('apartmentPlaceholder')}
              value={formData.apartment || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('notes')}</label>
          <textarea
            name="notes"
            className="form-textarea"
            rows="2"
            placeholder={t('notesPlaceholder')}
            value={formData.notes || ''}
            onChange={handleChange}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={loading}
        >
          {loading ? t('savingAddress') : t('saveAddress')}
        </button>
      </form>
    </Modal>
  );
}
