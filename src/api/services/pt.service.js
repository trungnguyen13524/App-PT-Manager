import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const ptService = {
  getAssignments: (type) => apiClient.get(`/users/me/pt-assignments?type=${type}`),
  
  // Assign meal plan to a student
  assignMealPlan: (studentId, data) => apiClient.put(endpoints.PT.MEAL_PLAN.replace('{studentId}', studentId), data),
  
  // Assign exercises to a student
  assignExercises: (studentId, data) => apiClient.post(endpoints.PT.EXERCISES.replace('{studentId}', studentId), data),

  // Verification & Profile
  getVerificationStatus: () => apiClient.get(endpoints.PT.VERIFICATION_STATUS),
  submitVerification: (data) => apiClient.post(endpoints.PT.VERIFICATION, data),
  requestVerification: (data) => apiClient.post(endpoints.PT.VERIFICATION, data), // Added requestVerification
  getProfile: () => apiClient.get(endpoints.PT.ME),
  updateProfile: (data) => apiClient.patch(endpoints.PT.ME, data),
  
  // Earnings
  getEarnings: () => apiClient.get(endpoints.PT.EARNINGS),
  requestWithdrawal: (data, customHeaders = {}) => apiClient.post(endpoints.PT.WITHDRAWALS, data, { headers: { ...customHeaders } }),

  // Courses
  getCourses: () => apiClient.get(endpoints.PT.COURSES),
  getCourseDetail: (courseId) => apiClient.get(`${endpoints.PT.COURSES}/${courseId}`),
  createCourse: (data) => apiClient.post(endpoints.PT.COURSES, data),
  updateCourse: (courseId, data) => apiClient.patch(`${endpoints.PT.COURSES}/${courseId}`, data),
  updateCurriculum: (courseId, data) => apiClient.put(`${endpoints.PT.COURSES}/${courseId}/curriculum`, data),
  publishCourse: (courseId) => apiClient.post(`${endpoints.PT.COURSES}/${courseId}/publish`),
  restoreCourse: (courseId) => apiClient.post(`${endpoints.PT.COURSES}/${courseId}/restore`),
  uploadLessonVideo: (courseId, lessonId, formData) => apiClient.post(`${endpoints.PT.COURSES}/${courseId}/lessons/${lessonId}/video`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateLessonPreview: (courseId, lessonId, isPreview) => apiClient.patch(`${endpoints.PT.COURSES}/${courseId}/lessons/${lessonId}/preview`, { isPreview }),
  uploadCourseThumbnail: (courseId, formData) => apiClient.post(`${endpoints.PT.COURSES}/${courseId}/thumbnail`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }), // Added uploadCourseThumbnail

  // Students
  getStudents: () => apiClient.get(endpoints.PT.STUDENTS),
  getStudentDetail: (studentId) => apiClient.get(`${endpoints.PT.STUDENTS}/${studentId}`),
};

export default ptService;
