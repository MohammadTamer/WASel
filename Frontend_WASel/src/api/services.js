import { api } from './apiClient';

export const addressApi = {
  getMyAddresses: () => api.get('/api/addresses'),
  createAddress: (data) => api.post('/api/addresses', data),
  updateAddress: (id, data) => api.put(`/api/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/addresses/${id}`),
};

export const reviewApi = {
  createReview: (data) => api.post('/api/reviews', data),
  getReviewByOrder: (orderId) => api.get(`/api/reviews/order/${orderId}`),
  getStoreReviews: (storeId) => api.get(`/api/reviews/store/${storeId}`),
};

export const notificationApi = {
  getMyNotifications: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getCustomers: () => api.get('/api/admin/customers'),
  getStores: () => api.get('/api/admin/stores'),
  getDrivers: () => api.get('/api/admin/drivers'),
  getOrders: () => api.get('/api/admin/orders'),
  toggleUserActive: (userId) => api.patch(`/api/admin/users/${userId}/toggle-active`),
};

export const userApi = {
  getCustomerProfile: () => api.get('/api/customers/me'),
  updateProfile: (data) => api.put('/api/customers/me', data),
  getDriverProfile: () => api.get('/api/drivers/me'),
  updateDriverStatus: (status) => api.patch('/api/drivers/me/status', { status }),
};
