import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const paymentService = {
  // POST /payment/webhook/payos
  webhookPayos: (payload) => apiClient.post(endpoints.PAYMENT.WEBHOOK_PAYOS, payload),
  
  // POST /payment/checkout
  createCheckout: (payload) => apiClient.post(endpoints.PAYMENT.CHECKOUT, payload),
  
  // GET /payment/transactions
  getTransactions: (params) => apiClient.get(endpoints.PAYMENT.TRANSACTIONS, { params }),
  
  // GET /payment/subscription
  getSubscription: () => apiClient.get(endpoints.PAYMENT.SUBSCRIPTION),
  
  // GET /payment/courses
  getPurchasedCourses: (params) => apiClient.get(endpoints.PAYMENT.COURSES, { params })
};

export default paymentService;
