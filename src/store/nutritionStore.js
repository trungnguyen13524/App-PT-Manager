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
      targetDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
      if (Array.isArray(logsRes.data)) {
        parsedMeals = logsRes.data;
      } else if (logsRes.data && logsRes.data.meals) {
        Object.values(logsRes.data.meals).forEach(mealArray => {
          if (Array.isArray(mealArray)) {
            parsedMeals = [...parsedMeals, ...mealArray];
          }
        });
      }

      set({ 
        meals: parsedMeals, 
        dailySummary: summaryRes.data || get().dailySummary,
        isLoading: false 
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Lấy tóm tắt tuần (Fallback: Vì BE chưa có API Weekly, ta gọi Daily cho hôm nay để vẽ biểu đồ)
  fetchWeeklySummary: async (dateString) => {
    try {
      const { USE_MOCK } = require('../mocks');
      let responseData;
      
      if (USE_MOCK) {
        // Giả lập dữ liệu để không báo lỗi vàng
        responseData = { targetCalories: 2000, consumedCalories: 1250 };
      } else {
        const response = await nutritionService.getDailySummary({ date: dateString });
        responseData = response.data;
      }
      
      const currentDay = new Date(dateString).getDay();
      const mappedTodayIdx = currentDay === 0 ? 6 : currentDay - 1;
      
      // Tạo mảng tuần rỗng
      const fakeWeek = Array(7).fill({ targetCalories: 0, consumedCalories: 0 });
      if (responseData) {
        fakeWeek[mappedTodayIdx] = responseData;
      }
      
      set({ weeklySummary: fakeWeek });
    } catch (err) {
      // Đã ẩn console.warn để màn hình không bị vướng Log vàng khi lỗi mạng
      // console.warn('Lỗi kéo tóm tắt dinh dưỡng (daily fallback):', err.message);
    }
  },

  // Lấy thực đơn gợi ý (Meal Plan)
  fetchActiveMealPlan: async () => {
    try {
      const { USE_MOCK } = require('../mocks');
      if (USE_MOCK) {
        set({ suggestedMenu: {
          morning: [{ id: 1, title: 'Phở gà', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80', calories: 350, protein: 20 }],
          lunch: [{ id: 2, title: 'Cơm gà gạo lứt', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80', calories: 420, protein: 30 }],
          evening: [{ id: 3, title: 'Salad cá hồi', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', calories: 310, protein: 25 }]
        }});
        return;
      }
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
        const dateKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
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

