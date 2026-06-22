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
    let targetDate = date;
    if (!targetDate) {
      const now = new Date();
      targetDate = now.toISOString().split('T')[0];
    }
    set({ isLoading: true, error: null });
    try {
      const [logsRes, summaryRes] = await Promise.all([
        nutritionService.getFoodLogs({ date: targetDate }),
        nutritionService.getDailySummary({ date: targetDate })
      ]);

      // Backend trả về format mới: { date, meals: { breakfast: [], lunch: [], ... }, totals }
      // Hoặc format cũ: [ ... ]
      let parsedMeals = [];
      const data = logsRes.data || logsRes; // Xử lý nếu API client trả về obj unwrapped

      if (Array.isArray(data)) {
        parsedMeals = data;
      } else if (data && data.meals) {
        if (Array.isArray(data.meals)) {
          parsedMeals = data.meals;
        } else {
          Object.values(data.meals).forEach(mealArray => {
            if (Array.isArray(mealArray)) {
              parsedMeals = [...parsedMeals, ...mealArray];
            }
          });
        }
      }

      set({ 
        meals: parsedMeals, 
        dailySummary: summaryRes.data || summaryRes || get().dailySummary,
        isLoading: false 
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Lấy tóm tắt tuần bằng cách gọi 7 lần API Daily cho tuần hiện tại (Từ T2 đến CN)
  fetchWeeklySummary: async () => {
    try {
      const now = new Date();
      // Lấy ngày hiện tại theo chuẩn UTC để đồng bộ với Backend
      const utcNow = new Date(now.toISOString().split('T')[0] + 'T12:00:00Z');
      const currentDay = utcNow.getUTCDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(utcNow);
      monday.setUTCDate(utcNow.getUTCDate() + diffToMonday);

      const promises = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setUTCDate(monday.getUTCDate() + i);
        
        // Only fetch if date is not in the future (relative to utcNow)
        if (d > utcNow && d.getUTCDate() !== utcNow.getUTCDate() && d.getUTCMonth() !== utcNow.getUTCMonth()) {
          promises.push(Promise.resolve({ data: { consumed: {}, target: {} } }));
        } else {
          const dateStr = d.toISOString().split('T')[0];
          promises.push(nutritionService.getDailySummary({ date: dateStr }).catch(() => ({ data: { consumed: {}, target: {} } })));
        }
      }

      const results = await Promise.all(promises);
      const weeklyData = results.map(res => res.data || res || { consumed: {}, target: {} });
      
      set({ weeklySummary: weeklyData });
    } catch (err) {
      console.warn('Lỗi kéo tóm tắt dinh dưỡng tuần:', err.message);
    }
  },

  // Lấy thực đơn gợi ý (Meal Plan)
  fetchActiveMealPlan: async () => {
    try {
      const response = await nutritionService.getActiveMealPlan();
      set({ suggestedMenu: response.data || { morning: [], lunch: [], evening: [] } });
    } catch (err) {
      // Đã ẩn console.warn để màn hình không bị vướng Log vàng (API chưa có)
      // console.warn('Không thể lấy thực đơn gợi ý');
      set({ suggestedMenu: { morning: [], lunch: [], evening: [] } });
    }
  },

  // Thêm món ăn mới
  addFoodLog: async (foodData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await nutritionService.logFood(foodData);
      if (response.success) {
        // Tải lại dữ liệu ngày hiện tại theo timezone địa phương
        const logDate = new Date(foodData.consumedAt);
        const dateKey = logDate.toISOString().split('T')[0];
        await get().fetchDailyLogs(dateKey);
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

