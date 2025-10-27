import axios from 'axios';
import { authService as fbAuthSvc } from './firebase/auth';
import { courseService as fbCourseSvc } from './firebase/courses';
import { materialService as fbMaterialSvc } from './firebase/materials';
import { newsService as fbNewsSvc } from './firebase/news';
import { userService as fbUserSvc } from './firebase/users';

const USE_FIREBASE = String(process.env.REACT_APP_USE_FIREBASE ?? 'true').toLowerCase() === 'true';

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
  login: async (credentials) => {
    if (USE_FIREBASE) {
      const user = await fbAuthSvc.login(credentials);
      return { data: { user, accessToken: (await window?.firebaseToken) || '' } };
    }
    return api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    if (USE_FIREBASE) {
      const user = await fbAuthSvc.register(userData);
      return { data: { user, accessToken: (await window?.firebaseToken) || '' } };
    }
    return api.post('/auth/register', userData);
  },
  googleLogin: async (idToken) => {
    if (USE_FIREBASE) {
      // For now rely on App.js Google One Tap -> backend flow not used; skip
      throw { response: { data: { error: 'Google login via backend disabled. Use email/password for demo.' } } };
    }
    return api.post('/auth/google', { idToken });
  },
  getCurrentUser: async () => {
    if (USE_FIREBASE) {
      const user = await fbAuthSvc.getCurrentUser();
      return { data: user };
    }
    return api.get('/auth/me');
  },
};

// Course API
export const courseAPI = {
  getAllCourses: async () => USE_FIREBASE ? { data: await fbCourseSvc.getAllCourses() } : api.get('/courses'),
  searchCourses: async (query) => USE_FIREBASE ? { data: await fbCourseSvc.searchCourses(query) } : api.get(`/courses?q=${encodeURIComponent(query)}`),
  getCourseById: async (id) => USE_FIREBASE ? { data: await fbCourseSvc.getCourseById(id) } : api.get(`/courses/${id}`),
  getCourseMaterials: async (courseId) => USE_FIREBASE ? { data: await fbMaterialSvc.getMaterialsByCourse(courseId) } : api.get(`/courses/${courseId}/materials`),
  // Recently visited courses helpers (used by HomePage)
  addRecentCourse: async (userId, courseId) => USE_FIREBASE ? { data: await fbCourseSvc.addRecentCourse(userId, courseId) } : api.post(`/users/${userId}/recent-courses`, { courseId }),
  getRecentCourses: async (userId) => USE_FIREBASE ? { data: await fbCourseSvc.getRecentCourses(userId) } : api.get(`/users/${userId}/recent-courses`),
};

// Material API
export const materialAPI = {
  uploadMaterial: async (courseId, formData) => {
    if (USE_FIREBASE) {
      const file = formData.get('file');
      const meta = { title: formData.get('title'), description: '', uploaderId: JSON.parse(localStorage.getItem('user') || '{}').id };
      const res = await fbMaterialSvc.uploadMaterial(courseId, file, meta);
      return { data: res };
    }
    return api.post(`/courses/${courseId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      },
    });
  },
  getMaterialsByCourse: async (courseId) => USE_FIREBASE ? { data: await fbMaterialSvc.getMaterialsByCourse(courseId) } : api.get(`/courses/${courseId}/materials`),
  deleteMaterial: async (id) => USE_FIREBASE ? { data: await fbMaterialSvc.deleteMaterial(id) } : api.delete(`/materials/${id}`),
};

// Rankings API
export const rankingsAPI = {
  getTopUploaders: async (limit = 50) => USE_FIREBASE ? { data: await fbUserSvc.getTopUploaders(limit) } : api.get(`/rankings?limit=${limit}`),
};

// News API
export const newsAPI = {
  getAllNews: async (page = 0, size = 10, search = null, type = null) => USE_FIREBASE ? { data: await fbNewsSvc.getAllNews(page, size, search, type) } : (() => { const params = new URLSearchParams({ page, size }); if (search) params.append('search', search); if (type) params.append('type', type); return api.get(`/news?${params.toString()}`); })(),
  getRecentNews: async (limit = 5) => USE_FIREBASE ? { data: await fbNewsSvc.getRecentNews(limit) } : api.get(`/news/recent?limit=${limit}`),
  createNews: async (newsData) => USE_FIREBASE ? { data: await fbNewsSvc.createNews(newsData) } : api.post('/news', newsData),
  updateNews: async (id, newsData) => USE_FIREBASE ? { data: await fbNewsSvc.updateNews?.(id, newsData) } : api.put(`/news/${id}`, newsData),
  deleteNews: async (id) => USE_FIREBASE ? { data: await fbNewsSvc.deleteNews?.(id) } : api.delete(`/news/${id}`),
};

// User API
export const userAPI = {
  getUserProfile: async (id) => USE_FIREBASE ? { data: await fbUserSvc.getUserById(id) } : api.get(`/users/${id}`),
  searchUsers: async (query) => USE_FIREBASE ? { data: await fbUserSvc.searchUsers(query) } : api.get(`/users/search?query=${encodeURIComponent(query)}`),
};

// Aggregated Search API
export const searchAPI = {
  searchAll: async (query) => {
    if (USE_FIREBASE) {
      const [users, courses, materials] = await Promise.all([
        fbUserSvc.searchUsers(query),
        fbCourseSvc.searchCourses(query),
        fbMaterialSvc.searchMaterials(query),
      ]);
      const packed = [
        ...users.map(u => ({ type: 'user', id: u.id, name: u.name || u.email || '', email: u.email || '' })),
        ...courses.map(c => ({ type: 'course', id: c.id, code: c.code || '', title: c.title || '' })),
        ...materials.map(m => ({ type: 'material', id: m.id, title: m.title || '', courseId: m.courseId || '', typeLabel: m.type || '' })),
      ];
      return { data: packed };
    }
    // TODO: implement backend aggregated search if needed
    return { data: [] };
  }
};

// File serving - direct access to uploaded files
export const getFileUrl = (path) => {
  if (USE_FIREBASE) {
    // In Firebase path, URLs are returned with material items; just return path for now
    return path;
  }
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