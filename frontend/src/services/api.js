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
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getCurrentUser: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getTopContributors: () => api.get('/users/rankings'),
  getTopFacultyContributors: () => api.get('/users/rankings/faculty'),
  getTopStudentContributors: () => api.get('/users/rankings/students'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByEmail: (email) => api.get(`/users/profile/${email}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getUploads: (userId) => api.get(`/users/${userId}/uploads`),
};

// Course API
export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  searchCourses: (query) => api.get(`/courses/search?q=${encodeURIComponent(query)}`),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getCoursesByUser: (userId) => api.get(`/courses/user/${userId}`),
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  unenrollFromCourse: (courseId) => api.delete(`/courses/${courseId}/enroll`),
  getCourseMaterials: (courseId) => api.get(`/courses/${courseId}/materials`),
};

// Material API
export const materialAPI = {
  uploadMaterial: (formData) => api.post('/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getMaterials: (params) => api.get('/materials', { params }),
  searchMaterials: (query) => api.get(`/materials/search?q=${encodeURIComponent(query)}`),
  getMaterialById: (id) => api.get(`/materials/${id}`),
  updateMaterial: (id, data) => api.put(`/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
  downloadMaterial: (id) => api.get(`/materials/${id}/download`, {
    responseType: 'blob',
  }),
  getRecentUploads: () => api.get('/materials/recent'),
  getMaterialsByCourse: (courseId, params) => api.get(`/materials/course/${courseId}`, { params }),
};

// News API
export const newsAPI = {
  getAllNews: () => api.get('/news'),
  getNewsByType: (type) => api.get(`/news/type/${type}`),
  getNewsById: (id) => api.get(`/news/${id}`),
  createNews: (data) => api.post('/news', data),
  updateNews: (id, data) => api.put(`/news/${id}`, data),
  deleteNews: (id) => api.delete(`/news/${id}`),
  pinNews: (id) => api.put(`/news/${id}/pin`),
  unpinNews: (id) => api.put(`/news/${id}/unpin`),
};

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// File Upload API
export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  uploadMaterial: (materialData, onProgress) => {
    const formData = new FormData();
    
    // Add file
    if (materialData.file) {
      formData.append('file', materialData.file);
    }
    
    // Add other material data
    Object.keys(materialData).forEach(key => {
      if (key !== 'file') {
        formData.append(key, materialData[key]);
      }
    });
    
    return api.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Statistics API
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getCourseStats: (courseId) => api.get(`/stats/courses/${courseId}`),
  getUserStats: (userId) => api.get(`/stats/users/${userId}`),
  getUploadStats: (params) => api.get('/stats/uploads', { params }),
  getPopularMaterials: () => api.get('/stats/materials/popular'),
  getRecentActivity: () => api.get('/stats/activity/recent'),
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return `Bad Request: ${data.message || 'Invalid data provided'}`;
      case 401:
        return 'Unauthorized: Please log in again';
      case 403:
        return 'Forbidden: You do not have permission to perform this action';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 409:
        return `Conflict: ${data.message || 'Resource already exists'}`;
      case 422:
        return `Validation Error: ${data.message || 'Invalid input data'}`;
      case 500:
        return 'Internal Server Error: Please try again later';
      default:
        return `Error ${status}: ${data.message || 'Something went wrong'}`;
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