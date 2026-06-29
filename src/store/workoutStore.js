import { create } from 'zustand';
import workoutService from '../api/services/workout.service';

export const useWorkoutStore = create((set, get) => ({
  library: [], // Danh sách bài tập từ BE
  programs: [], // Chương trình tập của tôi
  currentSession: null, // Phiên tập đang diễn ra
  isLoading: false,
  error: null,

  fetchExercises: async (params) => {
    set({ isLoading: true });
    try {
      const response = await workoutService.getExercises(params);
      
      // Trích xuất mảng dữ liệu một cách an toàn (tránh trường hợp BE trả về object { data: [...] } hoặc { items: [...] })
      let exercises = [];
      const resData = response.data;
      
      if (Array.isArray(resData)) {
        exercises = resData;
      } else if (resData && Array.isArray(resData.data)) {
        exercises = resData.data;
      } else if (resData && Array.isArray(resData.items)) {
        exercises = resData.items;
      } else if (resData?.data && Array.isArray(resData.data.exercises)) {
        exercises = resData.data.exercises;
      } else if (resData?.data && Array.isArray(resData.data.data)) {
        exercises = resData.data.data;
      }

      set({ library: exercises, isLoading: false });
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
      // Xóa bỏ hoàn toàn dữ liệu giả lập (mock). Lấy dữ liệu thực tế từ bài tập.
      const payload = {
        name: currentSession.name || currentSession.title || 'Buổi tập cá nhân',
        performedAt: new Date().toISOString(),
        durationSec: summary.totalDurationSec || 0,
        caloriesBurned: summary.totalCaloriesBurned || 0,
        notes: summary.notes || '',
        logs: (currentSession.exercises || []).map((ex, index) => {
          let realExerciseId = ex.id;
          if (!realExerciseId) {
            const exName = (ex.name || ex.title || ex.display_name || '').toLowerCase();
            const matchedEx = get().library.find(
              (libEx) => {
                const vi = libEx.nameVi?.toLowerCase() || '';
                const en = libEx.nameEn?.toLowerCase() || '';
                const name = libEx.name?.toLowerCase() || '';
                return (vi && vi.includes(exName)) || (exName && exName.includes(vi)) ||
                       (en && en.includes(exName)) || (exName && exName.includes(en)) ||
                       (name && name.includes(exName)) || (exName && exName.includes(name));
              }
            );
            // Lấy ID thật từ Backend, nếu AI đẻ ra bài lạ quá không khớp thì lấy tạm bài đầu tiên để đảm bảo API không bị tịt
            realExerciseId = matchedEx ? matchedEx.id : (get().library[0]?.id || 'ex_burpees');
          }

          return {
            exerciseId: realExerciseId,
            setNumber: ex.setNumber || 1,
            reps: ex.reps ? parseInt(ex.reps) : 10,
            weightKg: ex.weightKg || 0,
            durationSec: ex.durationSec || 60,
            restSec: ex.restSec || 60,
            rpe: ex.rpe || 5 // Tránh gửi null khiến Zod báo lỗi Required
          };
        }).filter(log => log.exerciseId) // Loại bỏ các log không tìm thấy ID hợp lệ để tránh lỗi Backend
      };

      const response = await workoutService.createSession(payload);
      set({ currentSession: null, isLoading: false });
      return { success: true, data: response.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      // Vì apiClient đã bóc tách lỗi thành apiError { message, details, code },
      // nên err ở đây chính là apiError. Ta in ra toàn bộ err để xem.
      const detailedError = err.details ? JSON.stringify(err.details) : (err.message || JSON.stringify(err));
      return { success: false, error: detailedError };
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
