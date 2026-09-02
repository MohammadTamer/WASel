import React, { useState, useEffect, useCallback } from 'react';
import { storeApi } from '../../api/storeApi';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export default function TeamManagementTab({ storeId, storeName }) {
  const { t } = useAuth();
  const { showToast } = useNotifications();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEmployees = useCallback(async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      const data = await storeApi.getStoreEmployees(storeId);
      setEmployees(data || []);
    } catch (err) {
      console.error('Failed to fetch store employees:', err);
      showToast(err.response?.data?.message || 'Failed to load team members', 'error');
    } finally {
      setLoading(false);
    }
  }, [storeId, showToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setSubmitting(true);
      await storeApi.addStoreEmployee(storeId, emailInput.trim());
      showToast(t('employeeAddedSuccess'), 'success');
      setEmailInput('');
      setIsAddModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to add employee:', err);
      showToast(err.response?.data?.message || 'Error assigning employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEmployee = async (userId, employeeName) => {
    const confirmMsg = `${t('removeEmployeeConfirm')} (${employeeName})`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(userId);
      await storeApi.removeStoreEmployee(storeId, userId);
      showToast(t('employeeRemovedSuccess'), 'success');
      fetchEmployees();
    } catch (err) {
      console.error('Failed to remove employee:', err);
      showToast(err.response?.data?.message || 'Error removing employee', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="team-management-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👥</span> {t('teamStaffTitle')}
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('teamStaffSubtitle')} - <strong>{storeName}</strong>
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {t('addEmployeeBtn')}
        </button>
      </div>

      {/* Employees Table / List */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ margin: 0 }}>{t('loadingTeamMembers')}</p>
          </div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👨‍🍳</div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{t('noEmployeesYet')}</h4>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', maxWidth: '480px', marginInline: 'auto' }}>
              {t('noEmployeesHint')}
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              {t('addEmployeeBtn')}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{
                  background: 'var(--bg-hover)',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>{t('employeeName')}</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>{t('employeeEmail')}</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>{t('employeePhone')}</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>{t('employeeRole')}</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>{t('employeeAssignedAt')}</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>{t('employeeActions')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}>
                          {emp.name ? emp.name.charAt(0).toUpperCase() : '👨‍🍳'}
                        </span>
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {emp.email}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {emp.phone || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <Badge variant="info">
                        👨‍🍳 {t('roleStoreEmployee')}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {emp.assignedAt ? new Date(emp.assignedAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRemoveEmployee(emp.userId, emp.name)}
                        disabled={deletingId === emp.userId}
                        style={{
                          color: 'var(--accent-rose)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.6rem'
                        }}
                      >
                        {deletingId === emp.userId ? '...' : `🗑️ ${t('removeEmployeeBtn')}`}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`✨ ${t('addEmployeeModalTitle')}`}
      >
        <form onSubmit={handleAddEmployee}>
          <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {t('addEmployeeModalSubtitle')}
          </p>

          <div className="form-group">
            <label className="form-label">{t('employeeEmail')} *</label>
            <input
              type="email"
              className="form-input"
              placeholder={t('employeeEmailPlaceholder')}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
              {t('addEmployeeModalHint')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !emailInput.trim()}
            >
              {submitting ? t('assigning') : t('addEmployeeBtn')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
