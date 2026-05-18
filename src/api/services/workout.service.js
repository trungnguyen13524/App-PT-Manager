import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Workout Module - 7 Endpoints
 */
const workoutService = {
  // GET /workout/exercises - Danh sách tất cả bài tập
  getExercises: (params) => apiClient.get(endpoints.WORKOUT.EXERCISES, { params }),
  
  // GET /workout/exercises/:id - Chi tiết kỹ thuật bài tập
  getExerciseDetail: (id) => apiClient.get(`${endpoints.WORKOUT.EXERCISES}/${id}`),
  
  // POST /workout/sessions - Bắt đầu một buổi tập mới
  // Body: { name, plannedExercises: [...] }
  startSession: (data) => apiClient.post(endpoints.WORKOUT.SESSIONS, data),
  
  // POST /workout/sessions/:id/logs - Ghi nhận kết quả một bài tập trong buổi
  logExerciseSet: (sessionId, data) => apiClient.post(`${endpoints.WORKOUT.SESSIONS}/${sessionId}/logs`, data),
  
  // POST /workout/sessions/:id/finish - Hoàn thành buổi tập
  finishSession: (sessionId, data) => apiClient.post(`${endpoints.WORKOUT.SESSIONS}/${sessionId}/finish`, data),
  
  // GET /workout/sessions - Lịch sử các buổi tập đã qua
  getWorkoutHistory: (params) => apiClient.get(endpoints.WORKOUT.SESSIONS, { params }),
  
  // GET /workout/programs/me - Chương trình tập cá nhân hóa hiện tại
  getMyPrograms: () => apiClient.get(endpoints.WORKOUT.PROGRAMS_ME),
};

export default workoutService;
