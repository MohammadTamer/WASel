import { api } from './apiClient';

export const storeApi = {
  getOpenStores: () => api.get('/api/stores'),
  getStoreById: (id) => api.get(`/api/stores/${id}`),
  getMyStores: () => api.get('/api/stores/my-stores'),
  createStore: (data) => api.post('/api/stores', data),
  updateStore: (id, data) => api.put(`/api/stores/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/stores/${id}/status`, { status }),

  // Categories
  getCategories: (storeId) => api.get(`/api/stores/${storeId}/categories`),
  createCategory: (storeId, data) => api.post(`/api/stores/${storeId}/categories`, data),
  updateCategory: (storeId, id, data) => api.put(`/api/stores/${storeId}/categories/${id}`, data),
  deleteCategory: (storeId, id) => api.delete(`/api/stores/${storeId}/categories/${id}`),

  // Products
  getProducts: (storeId) => api.get(`/api/stores/${storeId}/products`),
  getProductById: (storeId, id) => api.get(`/api/stores/${storeId}/products/${id}`),
  createProduct: (storeId, data) => api.post(`/api/stores/${storeId}/products`, data),
  updateProduct: (storeId, id, data) => api.put(`/api/stores/${storeId}/products/${id}`, data),
  toggleAvailability: (storeId, id) => api.patch(`/api/stores/${storeId}/products/${id}/availability`),
  deleteProduct: (storeId, id) => api.delete(`/api/stores/${storeId}/products/${id}`),

  // Employees & Team Management
  getStoreEmployees: (storeId) => api.get(`/api/stores/${storeId}/employees`),
  addStoreEmployee: (storeId, email) => api.post(`/api/stores/${storeId}/employees`, { email }),
  removeStoreEmployee: (storeId, userId) => api.delete(`/api/stores/${storeId}/employees/${userId}`),
};

