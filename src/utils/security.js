import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Lưu trữ token bảo mật
 * @param {string} token 
 */
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token', error);
  }
};

/**
 * Lấy token bảo mật
 * @returns {Promise<string | null>}
 */
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token', error);
    return null;
  }
};

/**
 * Xóa token bảo mật (khi đăng xuất)
 */
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token', error);
  }
};

/**
 * Lưu trữ refresh token bảo mật
 * @param {string} token 
 */
export const saveRefreshToken = async (token) => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving refresh token', error);
  }
};

/**
 * Lấy refresh token bảo mật
 * @returns {Promise<string | null>}
 */
export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token', error);
    return null;
  }
};

/**
 * Xóa refresh token bảo mật
 */
export const removeRefreshToken = async () => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token', error);
  }
};
