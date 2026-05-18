import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Admin Module - 13 Endpoints
 */
const adminService = {
  // --- Quản lý xác minh PT ---
  getPTVerifications: (params) => apiClient.get(endpoints.ADMIN.PT_VERIFICATIONS, { params }),
  approvePT: (id, data) => apiClient.post(`${endpoints.ADMIN.PT_VERIFICATIONS}/${id}/approve`, data),
  rejectPT: (id, data) => apiClient.post(`${endpoints.ADMIN.PT_VERIFICATIONS}/${id}/reject`, data),
  
  // --- Quản lý rút tiền ---
  getWithdrawals: (params) => apiClient.get(endpoints.ADMIN.WITHDRAWALS, { params }),
  approveWithdrawal: (id, data) => apiClient.post(`${endpoints.ADMIN.WITHDRAWALS}/${id}/approve`, data),
  rejectWithdrawal: (id, data) => apiClient.post(`${endpoints.ADMIN.WITHDRAWALS}/${id}/reject`, data),
  
  // --- Quản lý khóa học & Bài viết ---
  reviewCourse: (id, decision) => apiClient.post(`${endpoints.ADMIN.COURSES}/${id}/${decision}`), // decision: 'approve' | 'reject'
  getArticles: (params) => apiClient.get(endpoints.ADMIN.ARTICLES, { params }),
  createArticle: (data) => apiClient.post(endpoints.ADMIN.ARTICLES, data),
  updateArticle: (id, data) => apiClient.patch(`${endpoints.ADMIN.ARTICLES}/${id}`, data),
  
  // --- Quản lý Người dùng ---
  getUsers: (params) => apiClient.get(endpoints.ADMIN.USERS, { params }),
  suspendUser: (id, data) => apiClient.post(`${endpoints.ADMIN.USERS}/${id}/suspend`, data),
  unsuspendUser: (id) => apiClient.post(`${endpoints.ADMIN.USERS}/${id}/unsuspend`),
  
  // --- Log hệ thống ---
  getAuditLogs: (params) => apiClient.get(endpoints.ADMIN.AUDIT_LOGS, { params }),
};

export default adminService;
