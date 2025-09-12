import { apiGet, apiPostFormData, apiPutFormData, apiDelete, createFormData } from './apiClient.js';

// Create new configuration
export const createConfig = async (configData, token = null) => {
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
  
  return apiPostFormData('/config', formData, token);
};

// Get configuration by ID
export const getConfig = async (configId, token = null) => {
  return apiGet(`/config/${configId}`, token);
};

// Update existing configuration
export const updateConfig = async (configId, configData, token = null) => {
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
  
  return apiPutFormData(`/config/${configId}`, formData, token);
};

// Get all configurations
export const getAllConfigs = async (token = null) => {
  return apiGet('/config', token);
};

// Delete configuration
export const deleteConfig = async (configId, token = null) => {
  return apiDelete(`/config/${configId}`, token);
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