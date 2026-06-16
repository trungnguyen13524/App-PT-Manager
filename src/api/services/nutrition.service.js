import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const nutritionService = {
  // GET /nutrition/food-logs
  getFoodLogs: (params) => apiClient.get(endpoints.NUTRITION.FOOD_LOGS, { params }),

  // POST /nutrition/food-logs
  logFood: (data) => apiClient.post(endpoints.NUTRITION.FOOD_LOGS, data),

  // PATCH /nutrition/food-logs/{id}
  updateFoodLog: (id, data) => apiClient.patch(`${endpoints.NUTRITION.FOOD_LOGS}/${id}`, data),

  // DELETE /nutrition/food-logs/{id}
  deleteFoodLog: (id) => apiClient.delete(`${endpoints.NUTRITION.FOOD_LOGS}/${id}`),

  // GET /nutrition/summary/daily
  getDailySummary: (params) => apiClient.get(endpoints.NUTRITION.DAILY_SUMMARY, { params }),
};

export default nutritionService;
