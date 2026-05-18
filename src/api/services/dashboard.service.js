import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Dashboard Module - 3 Endpoints
 */
const dashboardService = {
  // GET /dashboard/user - Tổng quan cho học viên
  getUserDashboard: () => apiClient.get(endpoints.DASHBOARD.USER),
  
  // GET /dashboard/pt - Tổng quan cho PT
  getPTDashboard: () => apiClient.get(endpoints.DASHBOARD.PT),
  
  // GET /dashboard/admin - Tổng quan cho Admin
  getAdminDashboard: () => apiClient.get(endpoints.DASHBOARD.ADMIN),
};

export default dashboardService;
