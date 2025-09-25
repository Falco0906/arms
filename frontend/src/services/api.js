import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Course API
export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  searchCourses: (query) => api.get(`/courses?q=${encodeURIComponent(query)}`),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getCourseMaterials: (courseId) => api.get(`/courses/${courseId}/materials`),
};

// Material API
export const materialAPI = {
  uploadMaterial: (courseId, formData) => api.post(`/courses/${courseId}/materials`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // Increase timeout for file uploads
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('Upload progress:', percentCompleted);
    },
  }),
  getMaterialsByCourse: (courseId) => api.get(`/courses/${courseId}/materials`),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
};

// Rankings API
export const rankingsAPI = {
  getTopUploaders: (limit = 50) => api.get(`/rankings?limit=${limit}`),
};

// News API
export const newsAPI = {
  getAllNews: (page = 0, size = 10, search = null, type = null) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    return api.get(`/news?${params.toString()}`);
  },
  getRecentNews: (limit = 5) => api.get(`/news/recent?limit=${limit}`),
  createNews: (newsData) => api.post('/news', newsData),
  updateNews: (id, newsData) => api.put(`/news/${id}`, newsData),
  deleteNews: (id) => api.delete(`/news/${id}`)
};

// User API
export const userAPI = {
  getUserProfile: (id) => api.get(`/users/${id}`),
  searchUsers: (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`)
};

// File serving - direct access to uploaded files
export const getFileUrl = (path) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  return `${baseUrl}${path}`;
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    console.log('Server error response:', { status, data });
    
    switch (status) {
      case 400:
        return `Bad Request: ${data.error || 'Invalid data provided'}`;
      case 401:
        return 'Unauthorized: Please log in again';
      case 403:
        return 'Forbidden: You do not have permission to perform this action';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 409:
        return `Conflict: ${data.error || 'Resource already exists'}`;
      case 422:
        return `Validation Error: ${data.error || 'Invalid input data'}`;
      case 500:
        return 'Internal Server Error: Please try again later';
      default:
        return `Error ${status}: ${data.error || 'Something went wrong'}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network Error: Unable to connect to the server';
  } else {
    // Something else happened
    return `Error: ${error.message || 'An unexpected error occurred'}`;
  }
};

// Success response utility
export const handleAPISuccess = (response, message = 'Operation completed successfully') => {
  return {
    success: true,
    data: response.data,
    message,
  };
};

export default api;