import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * PT Module - 13 Endpoints
 */
const ptService = {
  // --- Xác minh danh tính ---
  requestVerification: (data) => apiClient.post(endpoints.PT.VERIFICATION, data),
  getVerificationStatus: () => apiClient.get(endpoints.PT.VERIFICATION_STATUS),
  
  // --- Hồ sơ PT ---
  getProfile: () => apiClient.get(endpoints.PT.ME),
  updateProfile: (data) => apiClient.patch(endpoints.PT.ME, data),
  
  // --- Quản lý học viên ---
  getStudents: (params) => apiClient.get(endpoints.PT.STUDENTS, { params }),
  getStudentDetail: (id) => apiClient.get(`${endpoints.PT.STUDENTS}/${id}`),
  assignMealPlan: (studentId, data) => apiClient.put(`${endpoints.PT.STUDENTS}/${studentId}/meal-plan`, data),
  assignExercises: (studentId, data) => apiClient.post(`${endpoints.PT.STUDENTS}/${studentId}/exercises`, data),
  
  // --- Quản lý khóa học ---
  getCourses: () => apiClient.get(endpoints.PT.COURSES),
  createCourse: (data) => apiClient.post(endpoints.PT.COURSES, data),
  updateCourse: (id, data) => apiClient.patch(`${endpoints.PT.COURSES}/${id}`, data),
  publishCourse: (id) => apiClient.post(`${endpoints.PT.COURSES}/${id}/publish`),
  
  // --- Tài chính ---
  getEarnings: (params) => apiClient.get(endpoints.PT.EARNINGS, { params }),
  requestWithdrawal: (data) => apiClient.post(endpoints.PT.WITHDRAWALS, data),
};

export default ptService;
