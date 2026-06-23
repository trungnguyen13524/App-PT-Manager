import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const usersService = {
  // GET /users/me
  getMe: () => apiClient.get(endpoints.USERS.ME),
  
  // PATCH /users/me
  updateMe: (data) => apiClient.patch(endpoints.USERS.ME, data),
  
  // DELETE /users/me
  deleteAccount: (data) => apiClient.delete(endpoints.USERS.ME, { data }),

  // POST /users/me/onboarding
  submitOnboarding: (data) => apiClient.post(endpoints.USERS.ONBOARDING, data),
  
  // GET /users/me/metrics
  getMetrics: () => apiClient.get(endpoints.USERS.METRICS),

  // PATCH /users/me/metrics
  updateMetrics: (data) => apiClient.patch(endpoints.USERS.METRICS, data),
  
  // POST /users/me/change-password
  changePassword: (data) => apiClient.post(endpoints.USERS.CHANGE_PASSWORD, data),
  
  // GET /users/me/pt-assignments
  fetchPTAssignments: (params) => apiClient.get(endpoints.USERS.PT_ASSIGNMENTS, { params }),

  // POST /users/me/avatar
  updateAvatar: (formData) => apiClient.post(endpoints.USERS.AVATAR, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default usersService;
