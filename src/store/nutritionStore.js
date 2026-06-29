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
  suggestedWorkout: null,
  weeklySummary: null,
  isLoading: false,
  error: null,
  lastLoggedAt: 0,

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
        nutritionService.getFoodLogs({ date: targetDate }).catch(err => ({ data: [] })),
        nutritionService.getDailySummary({ date: targetDate }).catch(err => ({ data: null }))
      ]);

      // Backend trả về format mới: { date, meals: { breakfast: [], lunch: [], ... }, totals }
      // Hoặc format cũ: [ ... ]
      let parsedMeals = [];
      const data = logsRes.data || logsRes; // Xử lý nếu API client trả về obj unwrapped

      if (Array.isArray(data)) {
        parsedMeals = data;
      } else if (data && data.items && Array.isArray(data.items)) {
        parsedMeals = data.items;
      } else if (data && data.foodLogs && Array.isArray(data.foodLogs)) {
        parsedMeals = data.foodLogs;
      } else if (data && data.data && Array.isArray(data.data)) {
        parsedMeals = data.data;
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

      let fetchedSummary = summaryRes.data || summaryRes;
      if (!fetchedSummary || fetchedSummary.error || (fetchedSummary.data === null)) {
        // Compute locally
        let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
        parsedMeals.forEach(m => {
          totalCal += m.calories || 0;
          totalP += m.protein || m.proteinG || m.macros?.proteinG || m.macros?.protein || 0;
          totalC += m.carbs || m.carbsG || m.macros?.carbsG || m.macros?.carbs || 0;
          totalF += m.fat || m.fatG || m.macros?.fatG || m.macros?.fat || 0;
        });
        fetchedSummary = {
          consumed: {
            calories: totalCal,
            proteinG: totalP,
            carbsG: totalC,
            fatG: totalF
          },
          target: get().dailySummary?.target || { calories: 2000, proteinG: 150, carbsG: 200, fatG: 60 }
        };
      }

      set({ 
        meals: parsedMeals, 
        dailySummary: fetchedSummary,
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
      const resData = response.data || response;
      const planData = resData.data || resData;

      if (planData && (planData.daily_meals || planData.exercise_plan)) {
        set({ 
          suggestedMenu: planData.daily_meals || [],
          suggestedWorkout: planData.exercise_plan || []
        });
      }
    } catch (err) {
      console.warn('Không thể lấy thực đơn gợi ý (Có thể chưa tạo lần nào):', err.message);
    }
  },

  // Tạo thực đơn AI & Lịch tập AI mới
  generateAIMealPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await nutritionService.generateMealPlan({});
      const resData = response.data || response;
      const planData = resData.data || resData; 
      
      if (planData && (planData.daily_meals || planData.exercise_plan)) {
        set({ 
          suggestedMenu: planData.daily_meals || [],
          suggestedWorkout: planData.exercise_plan || [],
          isLoading: false 
        });
        return { success: true, data: planData };
      } else {
        set({ isLoading: false, error: 'Invalid data format from AI' });
        return { success: false, error: 'Invalid data format from AI' };
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Thêm món ăn mới
  addFoodLog: async (foodData) => {
    // Chống spam: Phải cách nhau ít nhất 30 giây mới được log tiếp
    const now = Date.now();
    if (now - get().lastLoggedAt < 30000) {
      return { success: false, error: 'Vui lòng thao tác chậm lại. Hệ thống đang chống gian lận.' };
    }
    set({ lastLoggedAt: now });

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
    if (!id) return;
    try {
      await nutritionService.deleteFoodLog(id);
      set(state => ({
        meals: state.meals.filter(m => (m.id || m._id || m.foodLogId) !== id)
      }));
    } catch (err) {
      console.error('Lỗi khi xóa món ăn:', err);
    }
  }
}));

