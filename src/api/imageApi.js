import { apiPostFormData, createFormData } from './apiClient.js';

// Generate image preview (scaled down to 5%)
export const generatePreview = async (imageData) => {
  const { image, cropCoords } = imageData;
  
  const formData = createFormData(
    {
      cropCoords: JSON.stringify(cropCoords),
    },
    {
      image: image,
    }
  );
  
  const blob = await apiPostFormData('/image/preview', formData);
  
  // Convert blob to URL for display
  return URL.createObjectURL(blob);
};

// Generate full-quality cropped image with optional logo overlay
export const generateCroppedImage = async (imageData) => {
  const { image, cropCoords, configId } = imageData;
  
  const formData = createFormData(
    {
      cropCoords: JSON.stringify(cropCoords),
      configId: configId || null,
    },
    {
      image: image,
    }
  );
  
  const blob = await apiPostFormData('/image/generate', formData);
  
  // Convert blob to URL for download
  return URL.createObjectURL(blob);
};

// Download generated image
export const downloadImage = (imageUrl, filename = 'cropped-image.png') => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Validate image data before sending
export const validateImageData = (imageData) => {
  const errors = [];
  
  if (!imageData.image) {
    errors.push('Image file is required');
  } else if (imageData.image.type !== 'image/png') {
    errors.push('Image must be a PNG file');
  }
  
  if (!imageData.cropCoords || !Array.isArray(imageData.cropCoords) || imageData.cropCoords.length !== 4) {
    errors.push('Crop coordinates must be an array of 4 numbers [x, y, width, height]');
  } else {
    const [x, y, width, height] = imageData.cropCoords;
    if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
      errors.push('All crop coordinates must be numbers');
    }
    if (width <= 0 || height <= 0) {
      errors.push('Crop width and height must be greater than 0');
    }
  }
  
  return errors;
};

// Helper function to create crop coordinates from selection
export const createCropCoords = (selection, imageElement) => {
  if (!selection || !imageElement) return null;
  
  // Get the natural (actual) image dimensions
  const naturalWidth = imageElement.naturalWidth;
  const naturalHeight = imageElement.naturalHeight;
  
  // Get the displayed image dimensions
  const displayWidth = imageElement.offsetWidth;
  const displayHeight = imageElement.offsetHeight;
  
  // Calculate scale factors
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;
  
  // Scale the selection coordinates to match the natural image size
  return [
    Math.round(selection.x * scaleX),
    Math.round(selection.y * scaleY),
    Math.round(selection.width * scaleX),
    Math.round(selection.height * scaleY),
  ];
};