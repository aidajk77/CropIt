import { apiGet, apiPostFormData, apiPutFormData, createFormData } from './apiClient.js';

// Create new configuration
export const createConfig = async (configData) => {
  const { scaleDown, logoPosition, description, logoImage } = configData;
  
  const formData = createFormData(
    {
      scaleDown: scaleDown || null,
      logoPosition: logoPosition || 'bottom-right',
      description: description || null,
    },
    {
      logoImage: logoImage || null,
    }
  );
  
  return apiPostFormData('/config', formData);
};

// Get configuration by ID
export const getConfig = async (configId) => {
  return apiGet(`/config/${configId}`);
};

// Update existing configuration
export const updateConfig = async (configId, configData) => {
  const { scaleDown, logoPosition, description, logoImage } = configData;
  
  const formData = createFormData(
    {
      scaleDown: scaleDown || null,
      logoPosition: logoPosition || null,
      description: description || null,
    },
    {
      logoImage: logoImage || null,
    }
  );
  
  return apiPutFormData(`/config/${configId}`, formData);
};

// Get all configurations (if you add this endpoint later)
export const getAllConfigs = async () => {
  return apiGet('/config');
};

// Delete configuration (if you add this endpoint later)
export const deleteConfig = async (configId) => {
  return apiDelete(`/config/${configId}`);
};

// Validate configuration data before sending
export const validateConfigData = (configData) => {
  const errors = [];
  
  if (configData.scaleDown !== null && configData.scaleDown !== undefined) {
    const scale = parseFloat(configData.scaleDown);
    if (isNaN(scale) || scale <= 0 || scale > 0.25) {
      errors.push('Scale down must be a number between 0 and 0.25');
    }
  }
  
  const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
  if (configData.logoPosition && !validPositions.includes(configData.logoPosition)) {
    errors.push('Logo position must be one of: ' + validPositions.join(', '));
  }
  
  if (configData.logoImage && configData.logoImage.type !== 'image/png') {
    errors.push('Logo image must be a PNG file');
  }
  
  return errors;
};