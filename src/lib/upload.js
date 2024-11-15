import axios from 'axios';

const uploadImageToCloudinary = async (imageFile) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary credentials are missing:', {
      cloudName,
      uploadPreset,
    });
    throw new Error('Cloudinary credentials are not defined.');
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error.response?.data || error.message);
    throw new Error('Failed to upload image to Cloudinary.');
  }
};

export default uploadImageToCloudinary;