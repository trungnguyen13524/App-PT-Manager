import { create } from 'zustand';
import usersService from '../api/services/users.service';
import { USE_MOCK } from '../mocks';

export const useUserStore = create((set, get) => ({
  profile: null,
  metrics: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await usersService.getMe();
      set({ 
        profile: response.data, 
        metrics: response.data.metrics,
        isLoading: false 
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const response = await usersService.updateMe(data);
      set({ 
        profile: response.data, 
        metrics: response.data?.metrics || get().metrics,
        isLoading: false 
      });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  submitOnboarding: async (data) => {
    set({ isLoading: true });
    try {
      let responseData;
      if (USE_MOCK) {
        console.log('--- ĐANG SỬ DỤNG MOCK ONBOARDING ---');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        responseData = {
          bmr: 1693,
          tdee: 2624,
          dailyCalorieTarget: 2124,
          macros: { proteinG: 159, carbsG: 212, fatG: 71 },
          onboardingCompleted: true
        };
      } else {
        // Chỉ gửi raw data (giới tính, chiều cao, cân nặng...)
        const response = await usersService.submitOnboarding(data);
        
        // BE sẽ trả về các con số đã tính toán (bmr, tdee, dailyCalorieTarget, macros)
        responseData = {
          ...(response.data || {}),
          onboardingCompleted: true
        };
      }
      
      set({ 
        metrics: responseData, 
        isLoading: false 
      });
      return { success: true, data: responseData };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  updateAvatar: async (fileKey) => {
    try {
      // NOTE: BE chưa hỗ trợ API Upload/Avatar. Tạm thời chặn gọi API thật để tránh 404
      // const response = await usersService.updateAvatar(fileKey);
      // set((state) => ({ profile: { ...state.profile, avatarUrl: response.data.avatarUrl } }));
      
      console.warn("Tính năng Upload Avatar đang tạm đóng do BE chưa hỗ trợ API.");
      return { success: false, error: "Chức năng đổi ảnh đại diện đang được bảo trì từ hệ thống." };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}));

