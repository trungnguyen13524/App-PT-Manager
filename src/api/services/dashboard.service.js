import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const dashboardService = {
  // GET /dashboard/user
  getUserDashboard: () => apiClient.get(endpoints.DASHBOARD.USER),
};

export default dashboardService;
