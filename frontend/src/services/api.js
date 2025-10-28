import axios from 'axios';
import { authService as fbAuthSvc } from './firebase/auth';
import { courseService as fbCourseSvc } from './firebase/courses';
import { materialService as fbMaterialSvc } from './firebase/materials';
import { newsService as fbNewsSvc } from './firebase/news';
import { userService as fbUserSvc } from './firebase/users';
import { chatService as fbChatSvc } from './firebase/chat';

const USE_FIREBASE = true;

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
    const user = await fbAuthSvc.login(credentials);
    return { data: { user, accessToken: (await window?.firebaseToken) || '' } };
  },
  register: async (userData) => {
    const user = await fbAuthSvc.register(userData);
    return { data: { user, accessToken: (await window?.firebaseToken) || '' } };
  },
  googleLogin: async (idToken) => {
    // For now rely on App.js Google One Tap -> backend flow not used; skip
    throw { response: { data: { error: 'Google login via backend disabled. Use email/password for demo.' } } };
  },
  getCurrentUser: async () => {
    const user = await fbAuthSvc.getCurrentUser();
    return { data: user };
  },
};

// Course API
export const courseAPI = {
  getAllCourses: async () => ({ data: await fbCourseSvc.getAllCourses() }),
  searchCourses: async (query) => ({ data: await fbCourseSvc.searchCourses(query) }),
  getCourseById: async (id) => ({ data: await fbCourseSvc.getCourseById(id) }),
  getCourseMaterials: async (courseId) => ({ data: await fbMaterialSvc.getMaterialsByCourse(courseId) }),
  // Recently visited courses helpers (used by HomePage)
  addRecentCourse: async (userId, courseId) => ({ data: await fbCourseSvc.addRecentCourse(userId, courseId) }),
  getRecentCourses: async (userId) => ({ data: await fbCourseSvc.getRecentCourses(userId) }),
};

// Material API
export const materialAPI = {
  uploadMaterial: async (courseId, formData) => {
    const file = formData.get('file');
    let uploaderId = undefined;
    try { uploaderId = JSON.parse(localStorage.getItem('user') || '{}').id; } catch (_) { uploaderId = undefined; }
    const meta = { 
      title: formData.get('title'), 
      description: '', 
      materialType: formData.get('type') || 'OTHER',
      uploaderId 
    };
    const res = await fbMaterialSvc.uploadMaterial(courseId, file, meta);
    return { data: res };
      const res = await fbMaterialSvc.uploadMaterial(courseId, file, meta);
      return { data: res };
    }
    try {
      return await api.post(`/courses/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
          console.log('Upload progress:', percentCompleted);
        },
      });
    } catch (error) {
      // Network/timeout fallback to Firebase if available
      const isNetwork = !error.response || error.code === 'ECONNABORTED';
      if (isNetwork) {
        try {
          const file = formData.get('file');
          let uploaderId = undefined;
          try { uploaderId = JSON.parse(localStorage.getItem('user') || '{}').id; } catch (_) { uploaderId = undefined; }
          const meta = { title: formData.get('title'), description: '', materialType: formData.get('type') || 'OTHER', uploaderId };
          const res = await fbMaterialSvc.uploadMaterial(courseId, file, meta);
          return { data: res };
        } catch (fbErr) {
          throw fbErr;
        }
      }
      throw error;
    }
  },
  getMaterialsByCourse: async (courseId) => USE_FIREBASE ? { data: await fbMaterialSvc.getMaterialsByCourse(courseId) } : api.get(`/courses/${courseId}/materials`),
  deleteMaterial: async (id) => USE_FIREBASE ? { data: await fbMaterialSvc.deleteMaterial(id) } : api.delete(`/materials/${id}`),
  isLikedByUser: async (materialId, userId) => USE_FIREBASE ? { data: await fbMaterialSvc.isLikedByUser(materialId, userId) } : { data: false },
  getLikesCount: async (materialId) => USE_FIREBASE ? { data: await fbMaterialSvc.getLikesCount(materialId) } : { data: 0 },
  toggleLike: async (materialId, user) => {
    if (USE_FIREBASE) return { data: await fbMaterialSvc.toggleLike(materialId, user) };
    throw new Error('toggleLike not available offline');
  },
  getTopDownloads: async (limit = 6) => USE_FIREBASE ? { data: await fbMaterialSvc.getTopDownloads(limit) } : { data: [] },
  // Comments
  subscribeToComments: (materialId, cb) => {
    if (!USE_FIREBASE) return () => {};
    return fbMaterialSvc.subscribeToComments(materialId, cb);
  },
  addComment: async (materialId, payload) => USE_FIREBASE ? { data: await fbMaterialSvc.addComment(materialId, payload) } : { data: null },
  deleteComment: async (materialId, commentId) => USE_FIREBASE ? { data: await fbMaterialSvc.deleteComment(materialId, commentId) } : { data: null },
  getCommentsCount: async (materialId) => USE_FIREBASE ? { data: await fbMaterialSvc.getCommentsCount(materialId) } : { data: 0 },
};

// Rankings API
export const rankingsAPI = {
  getTopUploaders: async (limit = 50) => USE_FIREBASE ? { data: await fbUserSvc.getTopUploaders(limit) } : api.get(`/rankings?limit=${limit}`),
};

// News API
export const newsAPI = {
  getAllNews: async (page = 0, size = 10, search = null, type = null) => USE_FIREBASE ? { data: await fbNewsSvc.getAllNews(page, size, search, type) } : (() => { const params = new URLSearchParams({ page, size }); if (search) params.append('search', search); if (type) params.append('type', type); return api.get(`/news?${params.toString()}`); })(),
  getRecentNews: async (limit = 5) => USE_FIREBASE ? { data: await fbNewsSvc.getRecentNews(limit) } : api.get(`/news?limit=${limit}`),
  createNews: async (newsData) => USE_FIREBASE ? { data: await fbNewsSvc.createNews(newsData) } : api.post('/news', newsData),
  getUpcomingEvents: async (limit = 6) => {
    if (USE_FIREBASE) {
      const all = await fbNewsSvc.getAllNews(0, limit * 2, null, 'EVENT');
      const now = Date.now();
      return { data: (all || []).filter(e => e.type === 'EVENT' && new Date(e.date || e.createdAt) >= now).slice(0, limit) };
    }
    // Backend not implemented; return empty array
    return { data: [] };
  },
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

// Chat API
export const chatAPI = {
  subscribeToCourseMessages: (courseId, cb) => {
    if (!USE_FIREBASE) return () => {};
    return fbChatSvc.subscribeToCourseMessages(courseId, cb);
  },
  sendCourseMessage: async (courseId, payload) => {
    if (!USE_FIREBASE) return { data: null };
    return fbChatSvc.sendCourseMessage(courseId, payload);
  },
  getOrCreateDMConversation: async (currentUser, otherUser) => {
    if (!USE_FIREBASE) return { id: `local-${currentUser.id}-${otherUser.id}`, participants: [currentUser, otherUser] };
    return fbChatSvc.getOrCreateDMConversation(currentUser, otherUser);
  },
  subscribeToUserConversations: (userId, cb) => {
    if (!USE_FIREBASE) return () => {};
    return fbChatSvc.subscribeToUserConversations(userId, cb);
  },
  subscribeToDM: (conversationId, cb) => {
    if (!USE_FIREBASE) return () => {};
    return fbChatSvc.subscribeToDM(conversationId, cb);
  },
  sendDM: async (conversationId, payload) => {
    if (!USE_FIREBASE) return { data: null };
    return fbChatSvc.sendDM(conversationId, payload);
  },
};

// File serving - direct access to uploaded files
export const getFileUrl = (path) => {
  // If already an absolute URL, return as-is
  if (typeof path === 'string' && (/^https?:\/\//i).test(path)) return path;
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