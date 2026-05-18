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

  // Bắt đầu một phiên tập mới
  startSession: async (sessionData) => {
    set({ isLoading: true });
    try {
      const response = await workoutService.startSession(sessionData);
      set({ currentSession: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Ghi nhận một set tập
  logExerciseSet: async (exerciseId, setData) => {
    const session = get().currentSession;
    const sessionId = session?.id || session?.sessionId;
    if (!sessionId) return;

    try {
      await workoutService.logExerciseSet(sessionId, {
        exerciseId,
        ...setData
      });
    } catch (err) {
      console.error('Lỗi khi ghi nhận set tập:', err);
    }
  },


  // Kết thúc buổi tập
  finishSession: async (summary) => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({ isLoading: true });
    try {
      const response = await workoutService.finishSession(currentSession.id, summary);
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
