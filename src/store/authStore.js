import { create } from 'zustand';
import authService from '../api/services/auth.service';
import storage from '../utils/storage';
import { USE_MOCK, MOCK_LOGIN_RESPONSE } from '../mocks';

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
      let response;
      if (USE_MOCK) {
        console.log('--- ĐANG SỬ DỤNG MOCK LOGIN ---');
        // Giả lập delay mạng
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = MOCK_LOGIN_RESPONSE;
      } else {
        response = await authService.login(email, password);
      }
      
      // Theo Spec Backend: response.data chứa { user, tokens: { accessToken, refreshToken, expiresIn } }
      const { user, tokens } = response.data;
      
      // Lưu vào bộ nhớ bảo mật
      await storage.saveTokens(tokens.accessToken, tokens.refreshToken);
      await storage.saveUser(user);
      
      set({ 
        user, 
        token: tokens.accessToken, 
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        isOnboardingComplete: user.onboardingCompleted || false,
        isLoading: false 
      });
      return { success: true };
    } catch (err) {
      set({ 
        error: err.message || 'Đăng nhập thất bại', 
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
      const { user, tokens } = response.data;
      
      await storage.saveTokens(tokens.accessToken, tokens.refreshToken);
      await storage.saveUser(user);
      
      set({ 
        user, 
        token: tokens.accessToken, 
        refreshToken: tokens.refreshToken,
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
      await authService.logout();
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
  setUserRole: async (role) => {
    const updatedUser = { ...get().user, role };
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
