import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, t } = useAuth();
  const { showToast } = useNotifications();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER',
      });
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        showToast(t('passwordsDoNotMatch'), 'error');
        return;
      }
      if (formData.password.length < 6) {
        showToast(t('passwordTooShort'), 'error');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
        showToast(t('loginSuccess'), 'success');
        onClose();
      } else {
        const emailToKeep = formData.email;
        const { confirmPassword, ...registerPayload } = formData;
        await register(registerPayload);
        showToast(t('accountCreatedSuccess'), 'success');
        // Switch to login tab and pre-fill email
        setMode('login');
        setFormData({
          name: '',
          email: emailToKeep,
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'CUSTOMER',
        });
      }
    } catch (err) {
      showToast(err.message || t('authError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? t('loginTitle') : t('registerTitle')}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1 }}
          onClick={() => setMode('login')}
          type="button"
        >
          {t('loginTab')}
        </button>
        <button
          className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1 }}
          onClick={() => setMode('register')}
          type="button"
        >
          {t('registerTab')}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} autoComplete="off">
        {mode === 'register' && (
          <>
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder={t('fullNamePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('accountType')}</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="CUSTOMER">{t('roleCustomer')}</option>
                <option value="STORE_OWNER">{t('roleStoreOwner')}</option>
                <option value="STORE_EMPLOYEE">{t('roleStoreEmployee')}</option>
                <option value="DRIVER">{t('roleDriver')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('phone')}</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="01012345678"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">{t('email')}</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('password')}</label>
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">{t('confirmPassword')}</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.75rem' }}
          disabled={loading}
        >
          {loading ? t('checkingAuth') : mode === 'login' ? t('loginSubmit') : t('registerSubmit')}
        </button>
      </form>
    </Modal>
  );
}
