import { create } from 'zustand';
import ptService from '../api/services/pt.service';

export const usePTStore = create((set, get) => ({
  verificationStatus: null, // PENDING, APPROVED, REJECTED
  students: [],
  courses: [],
  profile: null,
  earnings: {
    balance: 0,
    history: []
  },
  isLoading: false,
  error: null,

  // --- Kiểm tra trạng thái xác minh ---
  fetchVerificationStatus: async () => {
    try {
      const response = await ptService.getVerificationStatus();
      set({ verificationStatus: response.data.status });
      return response.data.status;
    } catch (err) {
      console.warn('Chưa có thông tin xác minh PT');
      return null;
    }
  },

  // --- Gửi yêu cầu xác minh ---
  submitVerification: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ptService.requestVerification(data);
      set({ verificationStatus: 'PENDING', isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // --- Quản lý học viên ---
  fetchStudents: async () => {
    set({ isLoading: true });
    try {
      const response = await ptService.getStudents();
      set({ students: response.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // --- Quản lý khóa học ---
  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const response = await ptService.getCourses();
      set({ courses: response.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // --- Tài chính ---
  fetchEarnings: async () => {
    try {
      const response = await ptService.getEarnings();
      set({ earnings: response.data });
    } catch (err) {
      console.error('Lỗi lấy thông tin doanh thu:', err);
    }
  }
}));
