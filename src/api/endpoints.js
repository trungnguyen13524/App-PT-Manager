/**
 * Tất cả các endpoints của ứng dụng được định nghĩa tại đây.
 * Giúp dễ dàng quản lý và cập nhật khi có backend API.
 */
export const endpoints = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    ME: '/users/me',
    ONBOARDING: '/users/me/onboarding',
    METRICS: '/users/me/metrics',
    CHANGE_PASSWORD: '/users/me/change-password',
    PT_ASSIGNMENTS: '/users/me/pt-assignments',
    AVATAR: '/users/me/avatar',
  },
  NUTRITION: {
    FOOD_LOGS: '/nutrition/food-logs',
    DAILY_SUMMARY: '/nutrition/summary/daily',
    SCAN: '/scan',
  },
  FOODS: {
    SEARCH: '/foods/search',
    CATEGORIES: '/foods/categories',
    DETAIL: '/foods', // Will be constructed as /foods/{id}
  },
  DASHBOARD: {
    USER: '/dashboard/user',
  },
  PAYMENT: {
    WEBHOOK_PAYOS: '/payment/webhook/payos',
    CHECKOUT: '/payment/checkout',
    TRANSACTIONS: '/payment/transactions',
    SUBSCRIPTION: '/payment/subscription',
    COURSES: '/payment/courses',
  },
  WORKOUT: {
    EXERCISES: '/workout/exercises', // Used for list and detail
    SESSIONS: '/workout/sessions',
  },
  PT: {
    VERIFICATION: '/pt/verification',
    VERIFICATION_STATUS: '/pt/verification/status',
    ME: '/pt/me',
    COURSES: '/pt/courses',
    STUDENTS: '/pt/students',
    MEAL_PLAN: '/pt/students/{studentId}/meal-plan',
    EXERCISES: '/pt/students/{studentId}/exercises',
    EARNINGS: '/pt/earnings',
    WITHDRAWALS: '/pt/withdrawals',
  },
  ADMIN: {
    PT_VERIFICATIONS: '/admin/pt-verifications',
    WITHDRAWALS: '/admin/withdrawals',
    ARTICLES: '/admin/articles',
    CATEGORIES: '/admin/categories',
    QUESTS: '/admin/quests',
  },
  CONTENT: {
    DISCOVER_PT_COURSES: '/content/discover/pt-courses',
    PT_COURSES: '/content/pt-courses', // e.g. /content/pt-courses/{id}
    ARTICLES: '/content/articles',
    CATEGORIES: '/content/categories',
  },
  QUESTS: {
    DAILY: '/quests/daily',
    TRIGGER: '/quests/trigger',
    DIARY_LOCK: '/quests/diary-lock',
    POINTS: '/quests/points',
    REWARDS: '/quests/rewards',
    REDEEM: '/quests/redeem',
    REDEMPTIONS: '/quests/redemptions',
  }
};

