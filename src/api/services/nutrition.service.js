import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Nutrition Module - 7 Endpoints (Gồm Meal Plans, Food Logs và Summaries)
 */
const nutritionService = {
  // POST /nutrition/meal-plans/generate - Tự động tạo thực đơn bằng AI
  generateMealPlan: (data) => apiClient.post(endpoints.NUTRITION.GENERATE_MEAL_PLAN, data),
  
  // GET /nutrition/meal-plans/active - Lấy thực đơn đang áp dụng
  getActiveMealPlan: () => apiClient.get(endpoints.NUTRITION.ACTIVE_MEAL_PLAN),
  
  // GET /nutrition/food-logs - Lấy danh sách nhật ký ăn uống
  getFoodLogs: (params) => apiClient.get(endpoints.NUTRITION.FOOD_LOGS, { params }),
  
  // POST /nutrition/food-logs - Lưu một món ăn đã ăn
  logFood: (data) => apiClient.post(endpoints.NUTRITION.FOOD_LOGS, data),
  
  // PATCH /nutrition/food-logs/:id - Chỉnh sửa nhật ký ăn uống
  updateFoodLog: (id, data) => apiClient.patch(`${endpoints.NUTRITION.FOOD_LOGS}/${id}`, data),
  
  // DELETE /nutrition/food-logs/:id - Xóa nhật ký ăn uống
  deleteFoodLog: (id) => apiClient.delete(`${endpoints.NUTRITION.FOOD_LOGS}/${id}`),
  
  // GET /nutrition/summary/daily - Tóm tắt dinh dưỡng ngày
  getDailySummary: (date) => apiClient.get(endpoints.NUTRITION.DAILY_SUMMARY, { params: { date } }),
  
  // GET /nutrition/summary/weekly - Tóm tắt dinh dưỡng tuần
  getWeeklySummary: (weekStart) => apiClient.get(endpoints.NUTRITION.WEEKLY_SUMMARY, { params: { weekStart } }),
};

export default nutritionService;
