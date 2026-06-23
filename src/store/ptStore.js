import { create } from 'zustand';
import ptService from '../api/services/pt.service';

export const usePTStore = create((set, get) => ({
  verificationStatus: null, // PENDING_REVIEW, APPROVED, REJECTED, NONE
  verificationData: null, // Stores the full payload including rejectReason, requireResubmit
  students: [],
  courses: [],
  profile: null,
  earnings: {
    balance: 0,
    history: []
  },
  isLoading: false,
  error: null,

  // --- Cập nhật hồ sơ PT ---
  fetchProfile: async () => {
    try {
      const response = await ptService.getProfile();
      set({ profile: response.data || null });
    } catch (err) {
      console.warn('Lỗi lấy hồ sơ PT:', err.message);
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ptService.updateProfile(data);
      set({ profile: response.data, isLoading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  // --- Kiểm tra trạng thái xác minh ---
  fetchVerificationStatus: async () => {
    try {
      const response = await ptService.getVerificationStatus();
      const status = response.data?.status || response.data || 'NONE';
      set({
        verificationStatus: status,
        verificationData: response.data || null
      });
      return status;
    } catch (err) {
      console.warn('Lỗi kiểm tra xác minh PT:', err.message);

      // FALLBACK 1: Kiểm tra API getProfile do Backend cung cấp
      try {
        const profileRes = await ptService.getProfile();
        if (profileRes && profileRes.data && profileRes.data.id) {
          console.log('Fallback: PT profile exists, assuming APPROVED');
          set({ verificationStatus: 'APPROVED', verificationData: profileRes.data });
          return 'APPROVED';
        }
      } catch (profileErr) {
        // Bỏ qua lỗi
      }

      // FALLBACK 2: Kiểm tra Role PT trong authStore
      try {
        const { useAuthStore } = require('./authStore');
        const user = useAuthStore.getState().user;
        if (user && user.role === 'PT') {
          console.log('Fallback: User role is PT, assuming APPROVED');
          set({ verificationStatus: 'APPROVED' });
          return 'APPROVED';
        }
      } catch (fallbackErr) {
        // Bỏ qua lỗi
      }

      set({ verificationStatus: 'NONE', verificationData: null });
      return 'NONE';
    }
  },

  // --- Gửi yêu cầu xác minh ---
  submitVerification: async (data) => {
    set({ isLoading: true, error: null });
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
    console.log('--- FETCH COURSES INITIATED ---');
    set({ isLoading: true });
    try {
      const response = await ptService.getCourses();
      console.log('FETCH COURSES SUCCESS. Response Data:', JSON.stringify(response.data));
      set({ courses: response.data || [], isLoading: false });
    } catch (err) {
      console.log('FETCH COURSES ERROR:', err.message, err.response?.data);
      if (err.response?.status === 403) console.warn('Insufficient role to fetch courses');
      set({ error: err.message, isLoading: false });
    }
  },

  createCourse: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ptService.createCourse(data);
      // Cập nhật lại danh sách sau khi tạo
      get().fetchCourses();
      set({ isLoading: false });
      return { success: true, courseId: response.data?.id };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  updateCourse: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ptService.updateCourse(id, data);
      get().fetchCourses();
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg, locked: err.response?.status === 409 };
    }
  },

  publishCourse: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ptService.publishCourse(id);
      get().fetchCourses();
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      set({ error: errMsg, isLoading: false });
      // Trả về error payload để FE bắt được CURRICULUM_INCOMPLETE và danh sách bài học lỗi
      return { success: false, error: errMsg, payload: err.response?.data?.error };
    }
  },

  // --- Tài chính ---
  fetchEarnings: async () => {
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
