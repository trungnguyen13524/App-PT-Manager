import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const ptService = {
  // POST /pt/verification
  requestVerification: (data) => apiClient.post(endpoints.PT.VERIFICATION, data),
  // GET /pt/verification/status
  getVerificationStatus: () => apiClient.get(endpoints.PT.VERIFICATION_STATUS),
  
  // GET /pt/me
  getProfile: () => apiClient.get(endpoints.PT.ME),
  // PATCH /pt/me
  updateProfile: (data) => apiClient.patch(endpoints.PT.ME, data),
  
  // POST /pt/courses
  createCourse: (data) => apiClient.post(endpoints.PT.COURSES, data),
  // GET /pt/courses
  getCourses: (params) => apiClient.get(endpoints.PT.COURSES, { params }),
  // GET /pt/courses/{id}
  getCourseDetail: (id) => apiClient.get(`${endpoints.PT.COURSES}/${id}`),
  // PATCH /pt/courses/{id}
  updateCourse: (id, data) => apiClient.patch(`${endpoints.PT.COURSES}/${id}`, data),
  // PUT /pt/courses/{id}/curriculum
  updateCurriculum: (id, data) => apiClient.put(`${endpoints.PT.COURSES}/${id}/curriculum`, data),
  // POST /pt/courses/{id}/publish
  publishCourse: (id) => apiClient.post(`${endpoints.PT.COURSES}/${id}/publish`),
  // POST /pt/courses/{id}/archive
  archiveCourse: (id) => apiClient.post(`${endpoints.PT.COURSES}/${id}/archive`),

  // GET /pt/students
  getStudents: (params) => apiClient.get(endpoints.PT.STUDENTS, { params }),
  // GET /pt/students/{studentId}
  getStudentDetail: (studentId) => apiClient.get(`${endpoints.PT.STUDENTS}/${studentId}`),
  // PUT /pt/students/{studentId}/meal-plan
  assignMealPlan: (studentId, data) => apiClient.put(`${endpoints.PT.STUDENTS}/${studentId}/meal-plan`, data),
  // POST /pt/students/{studentId}/exercises
  assignExercises: (studentId, data) => apiClient.post(`${endpoints.PT.STUDENTS}/${studentId}/exercises`, data),
  
  // GET /pt/earnings
  getEarnings: (params) => apiClient.get(endpoints.PT.EARNINGS, { params }),
  // POST /pt/withdrawals
  requestWithdrawal: (data) => apiClient.post(endpoints.PT.WITHDRAWALS, data),
  // GET /pt/withdrawals
  getWithdrawals: (params) => apiClient.get(endpoints.PT.WITHDRAWALS, { params }),
};

export default ptService;
