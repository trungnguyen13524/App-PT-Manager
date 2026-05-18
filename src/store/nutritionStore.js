import { create } from 'zustand';
import nutritionService from '../api/services/nutrition.service';

export const useNutritionStore = create((set, get) => ({
  dailySummary: {
    consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    target: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    remaining: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    progressPercent: 0,
  },
  meals: [],
  suggestedMenu: null,
  weeklySummary: null,
  isLoading: false,
  error: null,

  // Lấy nhật ký thực phẩm và tổng kết ngày
  fetchDailyLogs: async (date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    set({ isLoading: true, error: null });
    try {
      const [logsRes, summaryRes] = await Promise.all([
        nutritionService.getFoodLogs({ date: targetDate }),
        nutritionService.getDailySummary(targetDate)
      ]);

      set({ 
        meals: logsRes.data || [], 
        dailySummary: summaryRes.data || get().dailySummary,
        isLoading: false 
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Lấy tóm tắt tuần
  fetchWeeklySummary: async (weekStart) => {
    try {
      const response = await nutritionService.getWeeklySummary(weekStart);
      set({ weeklySummary: response.data });
    } catch (err) {
      console.warn('Lỗi lấy tóm tắt tuần:', err.message);
    }
  },

  // Lấy thực đơn gợi ý (Meal Plan)
  fetchActiveMealPlan: async () => {
    try {
      const response = await nutritionService.getActiveMealPlan();
      set({ suggestedMenu: response.data });
    } catch (err) {
      console.warn('Không thể lấy thực đơn gợi ý');
    }
  },

  // Thêm món ăn mới
  addFoodLog: async (foodData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await nutritionService.logFood(foodData);
      if (response.success) {
        // Tải lại dữ liệu ngày hiện tại
        await get().fetchDailyLogs(foodData.consumedAt?.split('T')[0]);
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Xóa món ăn
  deleteFoodLog: async (id) => {
    try {
      await nutritionService.deleteFoodLog(id);
      set(state => ({
        meals: state.meals.filter(m => (m.id || m.foodLogId) !== id)
      }));
    } catch (err) {
      console.error('Lỗi khi xóa món ăn:', err);
    }
  }
}));

