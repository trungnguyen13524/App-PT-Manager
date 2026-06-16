import apiClient from '../apiClient';
import { endpoints } from '../endpoints';

/**
 * Foods Module
 */
const foodService = {
  // GET /foods/search - Tìm kiếm thực phẩm
  searchFoods: (params) => apiClient.get(endpoints.FOODS.SEARCH, { params }),
  
  // GET /foods/categories - Lấy danh mục thực phẩm
  getFoodCategories: (params) => apiClient.get(endpoints.FOODS.CATEGORIES, { params }),
  
  // GET /foods/:id - Lấy chi tiết thực phẩm
  getFoodDetail: (id) => apiClient.get(`${endpoints.FOODS.DETAIL}/${id}`),
};

export default foodService;
