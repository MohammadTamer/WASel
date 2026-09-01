import { api } from './apiClient';

export const deliveryApi = {
  getAvailableDeliveries: () => api.get('/api/deliveries/available'),
  getMyDeliveries: () => api.get('/api/deliveries/my-deliveries'),
  getDeliveryDetails: (id) => api.get(`/api/deliveries/${id}`),
  
  // Driver workflow
  acceptDelivery: (id) => api.patch(`/api/deliveries/${id}/accept`),
  pickupDelivery: (id) => api.patch(`/api/deliveries/${id}/pickup`),
  startDelivery: (id) => api.patch(`/api/deliveries/${id}/on-the-way`),
  completeDelivery: (id) => api.patch(`/api/deliveries/${id}/deliver`),
};
