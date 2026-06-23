import { create } from 'zustand';
import authService from '../api/services/auth.service';
import storage from '../utils/storage';

export const useAuthStore = create((set, get) => ({
  user: null,         
  token: null,        
  refreshToken: null, 
  isLoading: false,   
  error: null,        
  isAuthenticated: false,
  isOnboardingComplete: false,
  isInitialized: false, // Trạng thái đã nạp xong từ storage chưa

  // --- Khởi tạo: Nạp lại phiên làm việc cũ ---
  initialize: async () => {
    try {
      const [token, refreshToken, user] = await Promise.all([
        storage.getAccessToken(),
        storage.getRefreshToken(),
        storage.getUser()
      ]);

      if (token && user) {
        set({ 
          token, 
          refreshToken, 
          user, 
          isAuthenticated: true, 
          isOnboardingComplete: user.onboardingCompleted || false 
        });
      }
    } catch (e) {
      console.error('Lỗi khởi tạo AuthStore:', e);
    } finally {
      set({ isInitialized: true });
    }
  },

  // --- Đăng nhập (Real API) ---
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      console.log('--- GỌI API LOGIN THẬT ĐỂ TEST ---');
      const response = await authService.login(email, password);
      console.log('Login Response:', response);
      
      // Theo Spec Backend: response.data chứa { user, accessToken, refreshToken }
      let { user, accessToken, refreshToken } = response.data;
      
      // Nếu API trả về cấu trúc lồng nhau
      if (!user && response.data.tokens) {
        accessToken = response.data.tokens.accessToken;
        refreshToken = response.data.tokens.refreshToken;
        user = response.data.user;
      }
      
      // Khởi tạo user rỗng nếu vẫn undefined
      if (!user) user = {};

      // Lưu vào bộ nhớ bảo mật để các request tiếp theo có token
      await storage.saveTokens(accessToken, refreshToken);
      console.log('Saved tokens to storage');

      // Fetch full profile từ /users/me để lấy chính xác trạng thái onboardingCompleted và metrics
      try {
        console.log('Fetching full profile from /users/me...');
        const { default: usersService } = require('../api/services/users.service');
        const meResponse = await usersService.getMe();
        console.log('Full profile response:', meResponse);
        if (meResponse && meResponse.data) {
          user = { 
            ...user, 
            ...meResponse.data,
            // Bỏ qua Onboarding/KYC ngay lập tức nếu user là PT (bởi vì Admin đã duyệt trên Web)
            onboardingCompleted: meResponse.data.role === 'PT' || meResponse.data.onboardingCompleted || !!meResponse.data.metrics 
          };
        }
      } catch (meErr) {
        console.warn('Không thể lấy full profile sau khi login:', meErr);
      }

      console.log('Final user object before save:', user);
      await storage.saveUser(user);
      
      console.log('Setting auth state to authenticated');
      set({ 
        user, 
        token: accessToken, 
        refreshToken: refreshToken,
        isAuthenticated: true,
        isOnboardingComplete: user.onboardingCompleted || false,
        isLoading: false 
      });
      return { success: true };
    } catch (err) {
      console.error('Login Error Caught:', err);
      let errorMsg = err.message || 'Đăng nhập thất bại';
      if (err.code === 'INVALID_CREDENTIALS' || errorMsg.includes('Invalid email or password')) {
        errorMsg = 'Tài khoản chưa được đăng ký hoặc sai mật khẩu!';
      }
      set({ 
        error: errorMsg, 
        isLoading: false 
      });
      return { success: false };
    }
  },

  // --- Đăng ký ---
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      
      // Theo Spec Backend mới: response.data chứa { user, accessToken, refreshToken }
      const { user, accessToken, refreshToken } = response.data;
      
      await storage.saveTokens(accessToken, refreshToken);
      await storage.saveUser(user);
      
      set({ 
        user, 
        token: accessToken, 
        refreshToken: refreshToken,
        isAuthenticated: true,
        isOnboardingComplete: false,
        isLoading: false 
      });
      return { success: true };
    } catch (err) {
      set({ 
        error: err.message || 'Đăng ký thất bại', 
        isLoading: false 
      });
      return { success: false };
    }
  },

  // --- Cập nhật Tokens (Dùng cho Refresh logic) ---
  setTokens: async (token, refreshToken) => {
    await storage.saveTokens(token, refreshToken);
    set({ token, refreshToken: refreshToken || get().refreshToken });
  },

  // --- Đăng xuất ---
  logout: async () => {
    try {
      await authService.logout(get().refreshToken);
    } catch (e) {
      console.warn('Logout API failed, clearing local data anyway.');
    } finally {
      await storage.clearAll();
      set({ 
        user: null, 
        token: null, 
        refreshToken: null,
        isAuthenticated: false,
        isOnboardingComplete: false,
        isLoading: false,
        error: null
      });
    }
  },

  // --- Các actions khác ---
  syncProfileAndToken: async () => {
    try {
      // 1. Force refresh token to get new roles in JWT payload
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://test-nutricoach.onrender.com/api/v1';
      const axios = require('axios').default;
      const response = await axios.post(`${baseUrl}/auth/refresh`, {
        refreshToken: get().refreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
      if (accessToken) {
        await storage.saveTokens(accessToken, newRefreshToken || get().refreshToken);
        set({ token: accessToken, refreshToken: newRefreshToken || get().refreshToken });
      }

      // 2. Fetch new profile data
      const { default: usersService } = require('../api/services/users.service');
      // Pass token explicitly to ensure we use the fresh one
      const meResponse = await usersService.getMe();
      if (meResponse && meResponse.data) {
        const updatedUser = { 
          ...get().user, 
          ...meResponse.data,
          onboardingCompleted: meResponse.data.role === 'PT' || meResponse.data.onboardingCompleted || !!meResponse.data.metrics 
        };
        await storage.saveUser(updatedUser);
        set({ user: updatedUser, isOnboardingComplete: updatedUser.onboardingCompleted });
      }
      return true;
    } catch (e) {
      console.warn('Failed to sync profile and token', e);
      return false;
    }
  },
  setUserRole: async (role) => {
    const updatedUser = { ...get().user, role };
    await storage.saveUser(updatedUser);
    set({ user: updatedUser });
  },

  updateUser: async (updates) => {
    const updatedUser = { ...get().user, ...updates };
    await storage.saveUser(updatedUser);
    set({ user: updatedUser });
  },

  completeOnboarding: async (metrics) => {
    const updatedUser = { 
      ...get().user, 
      onboardingCompleted: true,
      metrics: metrics || get().user?.metrics 
    };
    await storage.saveUser(updatedUser);
    set({ isOnboardingComplete: true, user: updatedUser });
  },

  clearError: () => set({ error: null })
}));
