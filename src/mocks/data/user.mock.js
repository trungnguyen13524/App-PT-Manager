// Dữ liệu giả cho Học viên
export const MOCK_STUDENT = {
  id: 'usr_001',
  role: 'USER',
  email: 'student@test.com',
  fullName: 'Nguyễn Văn Học Viên',
  avatar: 'https://i.pravatar.cc/150?u=student',
  metrics: {
    height: 175,
    weight: 70,
    bmi: 22.9,
    tdee: 2500,
    goal: 'muscle_gain', // 'weight_loss' | 'maintenance' | 'muscle_gain'
  },
  subscription: {
    plan: 'pro', // 'free' | 'pro'
    expiresAt: '2026-12-31T23:59:59Z',
  }
};

// Dữ liệu giả cho Huấn luyện viên
export const MOCK_PT = {
  id: 'usr_002',
  role: 'PT',
  email: 'pt@test.com',
  fullName: 'Trần Văn PT',
  avatar: 'https://i.pravatar.cc/150?u=pt',
  status: 'approved', // 'pending' | 'approved' | 'rejected'
  walletBalance: 15000000,
  studentsCount: 15,
};

// Dữ liệu giả cho quá trình Login
export const MOCK_LOGIN_RESPONSE = {
  data: {
    tokens: {
      accessToken: 'mock_access_token_123',
      refreshToken: 'mock_refresh_token_456'
    },
    user: MOCK_STUDENT, // Đổi thành MOCK_PT nếu muốn test luồng PT
  }
};
