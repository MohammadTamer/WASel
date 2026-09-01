import { api } from './apiClient';

export const orderApi = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getMyOrders: () => api.get('/api/orders/my-orders'),
  getStoreOrders: (storeId) => api.get(`/api/orders/store-orders/${storeId}`),
  getOrderDetails: (id) => api.get(`/api/orders/${id}`),
  
  // Store actions
  acceptOrder: (id) => api.patch(`/api/orders/${id}/accept`),
  rejectOrder: (id, reason) => api.patch(`/api/orders/${id}/reject`, { reason }),
  prepareOrder: (id) => api.patch(`/api/orders/${id}/prepare`),
  startPreparing: (id) => api.patch(`/api/orders/${id}/prepare`),
  markReady: (id) => api.patch(`/api/orders/${id}/ready`),
  
  // Customer actions
  cancelOrder: (id, reason) => api.post(`/api/orders/${id}/cancel`, { reason }),
  reorder: (id) => api.post(`/api/orders/${id}/reorder`),
};
