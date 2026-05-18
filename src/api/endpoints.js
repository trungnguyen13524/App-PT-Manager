/**
 * Tất cả các endpoints của ứng dụng được định nghĩa tại đây.
 * Giúp dễ dàng quản lý và cập nhật khi có backend API.
 */
export const endpoints = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    APPLE: '/auth/apple',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  USERS: {
    ME: '/users/me',
    ONBOARDING: '/users/me/onboarding',
    METRICS: '/users/me/metrics',
    CHANGE_PASSWORD: '/users/me/change-password',
    AVATAR: '/users/me/avatar',
  },
  SCAN: {
    UPLOAD: '/scan',
    CONFIRM: '/scan/:scanId/confirm',
    HISTORY: '/scan/history',
    DETAIL: '/scan/:scanId',
  },
  NUTRITION: {
    GENERATE_MEAL_PLAN: '/nutrition/meal-plans/generate',
    ACTIVE_MEAL_PLAN: '/nutrition/meal-plans/active',
    FOOD_LOGS: '/nutrition/food-logs',
    DAILY_SUMMARY: '/nutrition/summary/daily',
    WEEKLY_SUMMARY: '/nutrition/summary/weekly',
  },
  WORKOUT: {
    EXERCISES: '/workout/exercises',
    SESSIONS: '/workout/sessions',
    PROGRAMS_ME: '/workout/programs/me',
  },
  PT: {
    VERIFICATION: '/pt/verification',
    VERIFICATION_STATUS: '/pt/verification/status',
    ME: '/pt/me',
    STUDENTS: '/pt/students',
    COURSES: '/pt/courses',
    EARNINGS: '/pt/earnings',
    WITHDRAWALS: '/pt/withdrawals',
  },
  PAYMENT: {
    CHECKOUT: '/payment/checkout',
    WEBHOOK_PAYOS: '/payment/webhook/payos',
    TRANSACTIONS: '/payment/transactions',
    SUBSCRIPTION: '/payment/subscription',
  },
  CONTENT: {
    ARTICLES: '/content/articles',
    DISCOVER_COURSES: '/content/discover/pt-courses',
    SEARCH: '/content/search',
  },
  DASHBOARD: {
    USER: '/dashboard/user',
    PT: '/dashboard/pt',
    ADMIN: '/dashboard/admin',
  },
  UPLOAD: {
    PRESIGNED_URL: '/upload/presigned-url',
  },
  ADMIN: {
    PT_VERIFICATIONS: '/admin/pt-verifications',
    WITHDRAWALS: '/admin/withdrawals',
    COURSES: '/admin/courses',
    ARTICLES: '/admin/articles',
    USERS: '/admin/users',
    AUDIT_LOGS: '/admin/audit-logs',
  }
};

