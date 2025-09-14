// Base API configuration using fetch
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || 'An error occurred';
    } catch {
      errorMessage = errorText || `HTTP ${response.status} - ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  // Return blob for image responses
  if (contentType && contentType.includes('image/')) {
    return response.blob();
  }
  
  return response.text();
};

// Helper function to get auth headers
const getAuthHeaders = (token) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// GET request
export const apiGet = async (endpoint, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(token),
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
};

// POST request with JSON data
export const apiPost = async (endpoint, data, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API POST Error:', error);
    throw error;
  }
};

// POST request with FormData (for file uploads)
export const apiPostFormData = async (endpoint, formData, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type header - let browser set it with boundary for FormData
        ...getAuthHeaders(token),
      },
      body: formData,
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API POST FormData Error:', error);
    throw error;
  }
};

// PUT request with JSON data
export const apiPut = async (endpoint, data, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API PUT Error:', error);
    throw error;
  }
};

// PUT request with FormData
export const apiPutFormData = async (endpoint, formData, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(token),
      },
      body: formData,
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API PUT FormData Error:', error);
    throw error;
  }
};

// DELETE request
export const apiDelete = async (endpoint, token = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(token),
      },
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('API DELETE Error:', error);
    throw error;
  }
};

// Helper to create FormData from object + file
export const createFormData = (data, fileFields = {}) => {
  const formData = new FormData();
  
  // Add regular data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  
  // Add file fields
  Object.entries(fileFields).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });
  
  return formData;
};