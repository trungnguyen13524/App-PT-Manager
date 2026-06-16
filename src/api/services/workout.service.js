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
  
  // POST /workout/sessions - Lưu một buổi tập (Single-shot log)
  createSession: (data) => apiClient.post(endpoints.WORKOUT.SESSIONS, data),
  
  // GET /workout/sessions - Lịch sử các buổi tập đã qua
  getWorkoutHistory: (params) => apiClient.get(endpoints.WORKOUT.SESSIONS, { params }),

  // GET /workout/sessions/:id - Chi tiết một buổi tập
  getSessionDetail: (id) => apiClient.get(`${endpoints.WORKOUT.SESSIONS}/${id}`),

  // PATCH /workout/sessions/:id - Sửa thông tin chung của buổi tập
  updateWorkoutSession: (id, data) => apiClient.patch(`${endpoints.WORKOUT.SESSIONS}/${id}`, data),

  // DELETE /workout/sessions/:id - Xóa buổi tập
  deleteWorkoutSession: (id) => apiClient.delete(`${endpoints.WORKOUT.SESSIONS}/${id}`),
};

export default workoutService;
