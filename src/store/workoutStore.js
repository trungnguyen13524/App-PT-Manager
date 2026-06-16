import { create } from 'zustand';
import workoutService from '../api/services/workout.service';

export const useWorkoutStore = create((set, get) => ({
  library: [], // Danh sách bài tập từ BE
  programs: [], // Chương trình tập của tôi
  currentSession: null, // Phiên tập đang diễn ra
  isLoading: false,
  error: null,

  // Lấy thư viện bài tập
  fetchExercises: async (params) => {
    set({ isLoading: true });
    try {
      const response = await workoutService.getExercises(params);
      set({ library: response.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Bắt đầu một phiên tập mới (Chỉ lưu Local)
  startSession: (sessionData) => {
    set({ currentSession: sessionData, isLoading: false, error: null });
    return { success: true, data: sessionData };
  },

  // Kết thúc buổi tập (Single-shot API)
  finishSession: async (summary) => {
    const { currentSession } = get();
    if (!currentSession) return { success: false, error: 'Không có phiên tập hiện tại' };

    set({ isLoading: true });
    try {
      // Chuẩn bị Payload theo chuẩn mới
      const payload = {
        name: currentSession.name || currentSession.title || 'Buổi tập cá nhân',
        performedAt: new Date().toISOString(),
        durationSec: summary.totalDurationSec || 0,
        caloriesBurned: summary.totalCaloriesBurned || 0,
        notes: summary.notes || '',
        logs: (currentSession.exercises || []).map((ex, index) => ({
          exerciseId: ex.id || 'EX_ID_MOCK',
          orderIndex: index,
          setNumber: 1, // Giả lập 1 hiệp
          reps: ex.reps ? parseInt(ex.reps) : 10,
          weightKg: 0,
          restSec: 60,
          notes: ''
        }))
      };

      const response = await workoutService.createSession(payload);
      set({ currentSession: null, isLoading: false });
      return { success: true, data: response.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Lấy lịch sử tập luyện
  fetchHistory: async () => {
    try {
      const response = await workoutService.getWorkoutHistory();
      return response.data;
    } catch (err) {
      console.warn('Không thể lấy lịch sử tập luyện');
      return [];
    }
  }
}));
