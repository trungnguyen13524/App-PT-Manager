import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Payment Module - 6 Endpoints
 */
const paymentService = {
  // POST /payment/checkout - Tạo phiên thanh toán (PayOS)
  // Body: { productType, productId, returnUrl, cancelUrl }
  createCheckoutSession: (data) => apiClient.post(endpoints.PAYMENT.CHECKOUT, data),
  
  // POST /payment/webhook/payos - Xử lý phản hồi từ PayOS
  handleWebhook: (data) => apiClient.post(endpoints.PAYMENT.WEBHOOK_PAYOS, data),
  
  // GET /payment/transactions - Lịch sử giao dịch
  getTransactions: (params) => apiClient.get(endpoints.PAYMENT.TRANSACTIONS, { params }),
  
  // GET /payment/transactions/:id - Chi tiết giao dịch
  getTransactionDetail: (id) => apiClient.get(`${endpoints.PAYMENT.TRANSACTIONS}/${id}`),
  
  // GET /payment/subscription - Thông tin gói hội viên hiện tại
  getSubscriptionStatus: () => apiClient.get(endpoints.PAYMENT.SUBSCRIPTION),
  
  // POST /payment/transactions/:id/cancel - Hủy payment link còn PENDING
  cancelPaymentIntent: (id) => apiClient.post(`${endpoints.PAYMENT.TRANSACTIONS}/${id}/cancel`),
};

export default paymentService;
