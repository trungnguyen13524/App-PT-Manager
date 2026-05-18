import authService from './auth.service';
import usersService from './users.service';
import scanService from './scan.service';
import nutritionService from './nutrition.service';
import workoutService from './workout.service';
import ptService from './pt.service';
import paymentService from './payment.service';
import contentService from './content.service';
import dashboardService from './dashboard.service';
import uploadService from './upload.service';
import adminService from './admin.service';

export {
  authService,
  usersService,
  scanService,
  nutritionService,
  workoutService,
  ptService,
  paymentService,
  contentService,
  dashboardService,
  uploadService,
  adminService
};

// Mặc định xuất một đối tượng chứa tất cả
const API = {
  auth: authService,
  users: usersService,
  scan: scanService,
  nutrition: nutritionService,
  workout: workoutService,
  pt: ptService,
  payment: paymentService,
  content: contentService,
  dashboard: dashboardService,
  upload: uploadService,
  admin: adminService
};

export default API;
