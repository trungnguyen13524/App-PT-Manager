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

      const res = await questsService.getDailyQuests({ date });
      
      let parsedQuests = [];
      let parsedPoints = get().totalPoints;
      
      if (Array.isArray(res)) {
        parsedQuests = res;
      } else if (Array.isArray(res.data)) {
        parsedQuests = res.data;
      } else if (res.data) {
        parsedQuests = res.data.dailyQuests || res.data.quests || res.data.data || [];
        parsedPoints = res.data.totalPoints ?? parsedPoints;
      }

      set({
        totalPoints: parsedPoints,
        dailyQuests: parsedQuests,
        challengeQuests: res.data?.challengeQuests || [],
        isLoadingMissions: false
      });

      const isDailyLoginTriggered = res.dailyLoginTriggered || (res.data && res.data.dailyLoginTriggered);
      if (isDailyLoginTriggered) {
        get().showReward('Điểm danh mỗi ngày', 10);
      }
    } catch (error) {
      console.warn('Error fetching missions:', error);
      set({ isLoadingMissions: false });
    }
  },

  triggerMissionAction: async (missionId, referenceId, date) => {
    try {
      const res = await questsService.triggerQuest({ questId: missionId, referenceId, date });
      
      const isTriggered = res.data?.triggered || res.triggered;
      if (isTriggered) {
        const points = res.data?.pointsAwarded || res.pointsAwarded || 0;
        const newTotal = res.data?.totalPoints || res.totalPoints;
        if (newTotal !== undefined) {
           set({ totalPoints: newTotal });
        }

        // Lấy thông tin tên nhiệm vụ để thông báo
        const quest = get().dailyQuests.find(q => q.id === missionId || q.type === missionId);
        if (quest) {
           get().showReward(`Hoàn thành: ${quest.title}`, points);
        } else {
           get().showReward('Nhiệm vụ hoàn thành', points);
        }

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
      const res = await questsService.lockDiary({ date });
      
      const completed = res.data?.missionsCompleted || res.missionsCompleted;
      if (completed && completed.length > 0) {
        const points = res.data?.pointsAwarded || res.pointsAwarded || 0;
        const newTotal = res.data?.totalPoints || res.totalPoints;
        if (newTotal !== undefined) {
           set({ totalPoints: newTotal });
        }

        if (completed.includes('PERFECT_DIARY')) {
          get().showReward('Nhật ký hoàn hảo', points > 0 ? points : 30);
        }
        if (completed.includes('DISCIPLINE_MASTER')) {
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
