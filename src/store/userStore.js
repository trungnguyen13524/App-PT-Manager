import { create } from 'zustand';
import usersService from '../api/services/users.service';

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
      // Chỉ gửi raw data (giới tính, chiều cao, cân nặng...)
      const response = await usersService.submitOnboarding(data);
      
      // BE sẽ trả về các con số đã tính toán (bmr, tdee, dailyCalorieTarget, macros)
      let responseData = {
        ...(response.data || {}),
        onboardingCompleted: true
      };
      
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

  updateAvatar: async (imageUri, mimeType = 'image/jpeg', fileName = 'avatar.jpg') => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      });
      
      const response = await usersService.updateAvatar(formData);
      
      if (response && response.data && response.data.avatarUrl) {
        const newAvatarUrl = response.data.avatarUrl;
        
        // Update userStore
        set((state) => ({ 
          profile: { ...state.profile, avatarUrl: newAvatarUrl },
          isLoading: false
        }));
        
        // Update authStore
        const { useAuthStore } = require('./authStore');
        const authState = useAuthStore.getState();
        if (authState.updateUser) {
          await authState.updateUser({ avatarUrl: newAvatarUrl });
        }
        
        return { success: true, avatarUrl: newAvatarUrl };
      }
      throw new Error("Không nhận được URL ảnh từ server");
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  }
}));

