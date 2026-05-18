/**
 * Chuyển đổi một chuỗi từ snake_case sang camelCase
 */
const toCamelCase = (str) => {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

/**
 * Đệ quy chuyển đổi toàn bộ keys của một object/array từ snake_case sang camelCase.
 * Sử dụng chủ yếu ở Axios Response Interceptor.
 */
export const keysToCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamelCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = keysToCamelCase(obj[key]);
    return acc;
  }, {});
};

/**
 * Chuyển đổi một chuỗi từ camelCase sang snake_case
 */
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Đệ quy chuyển đổi toàn bộ keys của một object/array từ camelCase sang snake_case.
 * Sử dụng chủ yếu ở Axios Request Interceptor trước khi gửi data lên BE.
 */
export const keysToSnakeCase = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnakeCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = toSnakeCase(key);
    acc[snakeKey] = keysToSnakeCase(obj[key]);
    return acc;
  }, {});
};
