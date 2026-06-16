import { create } from 'zustand';
import questsService from '../api/services/quests.service';

export const useMissionStore = create((set, get) => ({
  totalPoints: 0, 
  dailyQuests: [],
  challengeQuests: [],
  isLoadingMissions: false,
  rewardPopup: {
    visible: false,
    title: '',
    points: 0,
  },
  
  // Method to trigger a reward animation globally
  showReward: (title, points) => {
    // If a popup is already visible, hide it first, then show the new one
    if (get().rewardPopup.visible) {
      set({ rewardPopup: { visible: false, title: '', points: 0 } });
      setTimeout(() => {
        get().triggerReward(title, points);
      }, 300);
    } else {
      get().triggerReward(title, points);
    }
  },

  triggerReward: (title, points) => {
    set({ rewardPopup: { visible: true, title, points } });
    set((state) => ({ totalPoints: state.totalPoints + points }));
    
    // Auto hide after 3.5 seconds
    setTimeout(() => {
      set((state) => {
        // Only hide if it's the same popup (prevent hiding a newly triggered one)
        if (state.rewardPopup.title === title) {
          return { rewardPopup: { visible: false, title: '', points: 0 } };
        }
        return state;
      });
    }, 3500);
  },
  
  hideReward: () => set({ rewardPopup: { visible: false, title: '', points: 0 } }),
  
  // Method to deduct points when buying an item in Rewards Store
  spendPoints: (cost) => {
    if (get().totalPoints >= cost) {
      set((state) => ({ totalPoints: state.totalPoints - cost }));
      return true;
    }
    return false;
  },

  // --- API ACTIONS ---
  
  fetchDailyMissions: async (date) => {
    set({ isLoadingMissions: true });
    try {
      const { USE_MOCK } = require('../mocks');
      if (USE_MOCK) {
        set({
          totalPoints: 1250,
          dailyQuests: [
            { id: 1, title: 'Scan bữa sáng', status: 'COMPLETED', reward: 50 },
            { id: 2, title: 'Scan bữa trưa', status: 'PENDING', reward: 50 }
          ],
          challengeQuests: []
        });
        return;
      }

      const res = await questsService.getDailyQuests({ date });
      if (res.data) {
        set({
          totalPoints: res.data.totalPoints,
          dailyQuests: res.data.dailyQuests || [],
          challengeQuests: res.data.challengeQuests || []
        });

        if (res.data.dailyLoginTriggered) {
          get().showReward('Điểm danh mỗi ngày', 10);
        }
      }
    } catch (error) {
      // Ẩn log báo lỗi đỏ vì backend đang crash API daily quests
      // console.warn('Error fetching missions:', error);
      set({ isLoadingMissions: false });
    }
  },

  triggerMissionAction: async (missionId, referenceId, date) => {
    try {
      const { USE_MOCK } = require('../mocks');
      if (USE_MOCK) {
        get().fetchDailyMissions(date);
        return true;
      }

      const res = await questsService.triggerQuest({ missionId, referenceId, date });
      if (res.data && res.data.successTriggered) {
        get().fetchDailyMissions(date);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error triggering mission:', error);
      return false;
    }
  },

  lockDailyDiaryAction: async (date) => {
    try {
      const { USE_MOCK } = require('../mocks');
      if (USE_MOCK) {
        get().fetchDailyMissions(date);
        return true;
      }

      const res = await questsService.lockDiary({ date });
      if (res.data && res.data.success) {
        if (res.data.missionsCompleted && res.data.missionsCompleted.includes('PERFECT_DIARY')) {
          get().showReward('Nhật ký hoàn hảo', 30);
        }
        if (res.data.missionsCompleted && res.data.missionsCompleted.includes('DISCIPLINE_MASTER')) {
          setTimeout(() => {
             get().showReward('Kỷ luật', 50);
          }, 3500);
        }
        get().fetchDailyMissions(date);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error locking diary:', error);
      return false;
    }
  }
}));
