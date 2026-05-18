import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Content Module - 5 Endpoints (Public)
 */
const contentService = {
  // GET /content/articles - Danh sách bài viết
  getArticles: (params) => apiClient.get(endpoints.CONTENT.ARTICLES, { params }),
  
  // GET /content/articles/:slug - Chi tiết bài viết (Markdown)
  getArticleBySlug: (slug) => apiClient.get(`${endpoints.CONTENT.ARTICLES}/${slug}`),
  
  // GET /content/discover/pt-courses - Khám phá khóa học PT
  getPTCourses: (params) => apiClient.get(endpoints.CONTENT.DISCOVER_COURSES, { params }),
  
  // GET /content/pt-courses/:id - Chi tiết khóa học
  getCourseDetail: (id) => apiClient.get(`/content/pt-courses/${id}`),
  
  // GET /content/search - Tìm kiếm toàn hệ thống
  search: (query, type) => apiClient.get(endpoints.CONTENT.SEARCH, { params: { q: query, type } }),
};

export default contentService;
