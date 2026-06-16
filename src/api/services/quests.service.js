import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const questsService = {
  // GET /quests/daily
  getDailyQuests: (params) => apiClient.get(endpoints.QUESTS.DAILY, { params }),
  
  // POST /quests/trigger
  triggerQuest: (data) => apiClient.post(endpoints.QUESTS.TRIGGER, data),
  
  // POST /quests/diary-lock
  lockDiary: (data) => apiClient.post(endpoints.QUESTS.DIARY_LOCK, data),
  
  // GET /quests/points
  getPoints: (params) => apiClient.get(endpoints.QUESTS.POINTS, { params }),

  // --- Admin Quests ---
  // GET /admin/quests
  getAdminQuests: (params) => apiClient.get(endpoints.ADMIN.QUESTS, { params }),
  // POST /admin/quests
  createQuest: (data) => apiClient.post(endpoints.ADMIN.QUESTS, data),
  // GET /admin/quests/leaderboard
  getLeaderboard: (params) => apiClient.get(`${endpoints.ADMIN.QUESTS}/leaderboard`, { params }),
  // PATCH /admin/quests/{id}
  updateQuest: (id, data) => apiClient.patch(`${endpoints.ADMIN.QUESTS}/${id}`, data),
};

export default questsService;
