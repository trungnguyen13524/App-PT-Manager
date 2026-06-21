// src/utils/cloudinary.js

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dz7bcmaeh/image/upload';
const UPLOAD_PRESET = 'pt_documents';

/**
 * Uploads an image to Cloudinary using an unsigned preset.
 * @param {string} imageUri - The local URI of the image (e.g. from expo-image-picker).
 * @param {string} userId - The user ID to create a specific folder for the PT.
 * @returns {Promise<string>} - Returns the secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (imageUri, userId) => {
  if (!imageUri) throw new Error("No image URI provided");

  const formData = new FormData();
  
  // Create a file object from URI
  const filename = imageUri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type
  });
  
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Set the folder structure dynamically per user
  const folderPath = `pt_verifications/usr_${userId || 'unknown'}`;
  formData.append('folder', folderPath);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
