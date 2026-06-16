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
      // API might return data as a string or an object with status
      const status = response.data?.status || response.data || 'NONE';
      set({ verificationStatus: status });
      return status;
    } catch (err) {
      // API spec says 401 Unauthorized
      console.warn('Lỗi kiểm tra xác minh PT:', err.message);
      set({ verificationStatus: 'NONE' });
      return 'NONE';
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
      set({ verificationStatus: 'PENDING_REVIEW', isLoading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
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
      if (err.response?.status === 403) console.warn('Insufficient role to fetch students');
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
      if (err.response?.status === 403) console.warn('Insufficient role to fetch courses');
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
      set({ earnings: response.data || { balance: 0, history: [] } });
    } catch (err) {
      if (err.response?.status === 403) {
        console.warn('Lỗi lấy thông tin doanh thu: Insufficient role');
      } else {
        console.warn('Lỗi lấy thông tin doanh thu:', err.message || err.code || err);
      }
    }
  }
}));
