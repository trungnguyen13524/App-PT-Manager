import { create } from 'zustand';
import ptService from '../api/services/pt.service';
import { USE_MOCK, mockStudents, mockCourses, mockEarnings } from '../mocks';

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
    if (USE_MOCK) {
      // In mock mode, we assume the PT is either PENDING or already APPROVED based on some local mock, but let's default to null to show verification
      // If we want to simulate auto-approve, we could return APPROVED. But let's return PENDING initially to let user bypass.
      return null;
    }
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
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ verificationStatus: 'PENDING', isLoading: false });
      return { success: true };
    }
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
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ students: mockStudents, isLoading: false });
      return;
    }
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
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ courses: mockCourses, isLoading: false });
      return;
    }
    try {
      const response = await ptService.getCourses();
      set({ courses: response.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // --- Tài chính ---
  fetchEarnings: async () => {
    if (USE_MOCK) {
      set({ earnings: mockEarnings });
      return;
    }
    try {
      const response = await ptService.getEarnings();
      set({ earnings: response.data });
    } catch (err) {
      console.error('Lỗi lấy thông tin doanh thu:', err);
    }
  }
}));
