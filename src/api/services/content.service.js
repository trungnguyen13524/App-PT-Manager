import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

const contentService = {
  // GET /content/discover/pt-courses
  getDiscoverPTCourses: (params) => apiClient.get(endpoints.CONTENT.DISCOVER_PT_COURSES, { params }),
  
  // GET /content/pt-courses/{id}
  getPTCourseDetail: (id) => apiClient.get(`${endpoints.CONTENT.PT_COURSES}/${id}`),

  // GET /content/articles
  getArticles: (params) => apiClient.get(endpoints.CONTENT.ARTICLES, { params }),

  // GET /content/categories
  getCategories: (params) => apiClient.get(endpoints.CONTENT.CATEGORIES, { params }),

  // GET /content/articles/{slug}
  getArticleBySlug: (slug) => apiClient.get(`${endpoints.CONTENT.ARTICLES}/${slug}`),
};

export default contentService;
