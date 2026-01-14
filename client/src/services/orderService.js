import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createPaymentIntent: async (orderId) => {
    const response = await api.post('/payments/create-payment-intent', { orderId });
    return response.data;
  },

  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}/status`);
    return response.data;
  }
};
