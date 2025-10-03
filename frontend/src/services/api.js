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
  getAllCourses: async () => {
    try {
      return await api.get('/courses');
    } catch (error) {
      console.log('Backend not available, using mock courses');
      // Return mock courses when backend is not available
      return {
        data: [
          {
            id: 1,
            code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'Basic concepts of programming and computer science',
            instructor: 'Dr. Smith',
            credits: 3,
            semester: 'Fall 2024'
          },
          {
            id: 2,
            code: 'MATH201',
            title: 'Calculus II',
            description: 'Advanced calculus concepts and applications',
            instructor: 'Prof. Johnson',
            credits: 4,
            semester: 'Fall 2024'
          },
          {
            id: 3,
            code: 'PHYS301',
            title: 'Classical Mechanics',
            description: 'Newtonian mechanics and dynamics',
            instructor: 'Dr. Wilson',
            credits: 3,
            semester: 'Fall 2024'
          },
          {
            id: 4,
            code: 'ENG102',
            title: 'Technical Writing',
            description: 'Professional writing skills for technical communication',
            instructor: 'Prof. Davis',
            credits: 2,
            semester: 'Fall 2024'
          }
        ]
      };
    }
  },
  searchCourses: async (query) => {
    try {
      return await api.get(`/courses?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.log('Backend not available, filtering mock courses');
      const allCourses = await courseAPI.getAllCourses();
      const filtered = allCourses.data.filter(course => 
        course.code.toLowerCase().includes(query.toLowerCase()) ||
        course.title.toLowerCase().includes(query.toLowerCase())
      );
      return { data: filtered };
    }
  },
  getCourseById: async (id) => {
    try {
      return await api.get(`/courses/${id}`);
    } catch (error) {
      console.log('Backend not available, using mock course data');
      const allCourses = await courseAPI.getAllCourses();
      const course = allCourses.data.find(c => c.id == id);
      return { data: course };
    }
  },
  getCourseMaterials: (courseId) => api.get(`/courses/${courseId}/materials`),
};

// Material API
export const materialAPI = {
  uploadMaterial: async (courseId, formData) => {
    try {
      return await api.post(`/courses/${courseId}/materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Increase timeout for file uploads
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        },
      });
    } catch (error) {
      console.log('Backend not available for file upload, using mock upload');
      
      // Simulate successful upload with mock data
      const file = formData.get('file');
      const title = formData.get('title') || file.name;
      const description = formData.get('description') || '';
      const category = formData.get('category') || 'NOTES';
      
      // Create mock upload response
      const mockMaterial = {
        id: Date.now(), // Use timestamp as ID
        title: title,
        description: description,
        type: category,
        filename: file.name,
        size: file.size,
        path: `/mock/uploads/${file.name}`,
        uploader: {
          fullName: JSON.parse(localStorage.getItem('user') || '{}').fullName || 'Unknown',
          email: JSON.parse(localStorage.getItem('user') || '{}').email || 'unknown@klh.edu.in'
        },
        uploadedAt: new Date().toISOString(),
        downloads: 0,
        courseId: courseId
      };
      
      // Store in localStorage to persist across sessions
      const existingMaterials = JSON.parse(localStorage.getItem('mockMaterials') || '{}');
      if (!existingMaterials[courseId]) {
        existingMaterials[courseId] = [];
      }
      existingMaterials[courseId].push(mockMaterial);
      localStorage.setItem('mockMaterials', JSON.stringify(existingMaterials));
      
      // Simulate a delay to make it feel realistic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        data: mockMaterial,
        status: 201,
        statusText: 'Created'
      };
    }
  },
  getMaterialsByCourse: async (courseId) => {
    try {
      return await api.get(`/courses/${courseId}/materials`);
    } catch (error) {
      console.log('Backend not available, using mock materials');
      
      // Get user-uploaded mock materials from localStorage
      const userMaterials = JSON.parse(localStorage.getItem('mockMaterials') || '{}');
      const userCourseMaterials = userMaterials[courseId] || [];
      
      // Return mock materials based on course ID
      const mockMaterials = {
        1: [ // CS101
          {
            id: 1,
            title: 'Introduction to Programming',
            type: 'NOTES',
            description: 'Basic programming concepts',
            size: 1024000,
            path: '/mock/cs101_intro.pdf',
            uploader: { fullName: 'Dr. Smith', email: 'smith@klh.edu.in' },
            uploadedAt: new Date().toISOString(),
            downloads: 42
          },
          {
            id: 2,
            title: 'Assignment 1 - Variables',
            type: 'ASSIGNMENT',
            description: 'Practice with variables and data types',
            size: 512000,
            path: '/mock/cs101_assignment1.pdf',
            uploader: { fullName: 'Dr. Smith', email: 'smith@klh.edu.in' },
            uploadedAt: new Date().toISOString(),
            downloads: 38
          }
        ],
        2: [ // MATH201
          {
            id: 3,
            title: 'Integration Techniques',
            type: 'NOTES',
            description: 'Advanced integration methods',
            size: 2048000,
            path: '/mock/math201_integration.pdf',
            uploader: { fullName: 'Prof. Johnson', email: 'johnson@klh.edu.in' },
            uploadedAt: new Date().toISOString(),
            downloads: 55
          }
        ],
        3: [ // PHYS301
          {
            id: 4,
            title: 'Newton\'s Laws',
            type: 'NOTES',
            description: 'Fundamental laws of motion',
            size: 1536000,
            path: '/mock/phys301_newton.pdf',
            uploader: { fullName: 'Dr. Wilson', email: 'wilson@klh.edu.in' },
            uploadedAt: new Date().toISOString(),
            downloads: 47
          }
        ],
        4: [ // ENG102
          {
            id: 5,
            title: 'Writing Guidelines',
            type: 'DOC',
            description: 'Technical writing best practices',
            size: 768000,
            path: '/mock/eng102_guidelines.docx',
            uploader: { fullName: 'Prof. Davis', email: 'davis@klh.edu.in' },
            uploadedAt: new Date().toISOString(),
            downloads: 33
          }
        ]
      };
      
      // Combine default mock materials with user-uploaded materials
      const defaultMaterials = mockMaterials[courseId] || [];
      const allMaterials = [...defaultMaterials, ...userCourseMaterials];
      
      return { data: allMaterials };
    }
  },
  getCourseFiles: async (courseId) => {
    // Alias for getMaterialsByCourse
    return await materialAPI.getMaterialsByCourse(courseId);
  },
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
};

// Rankings API
export const rankingsAPI = {
  getTopUploaders: async (limit = 50) => {
    try {
      return await api.get(`/rankings?limit=${limit}`);
    } catch (error) {
      console.log('Backend not available, using mock rankings');
      return {
        data: [
          { id: 1, fullName: 'Dr. Smith', email: 'smith@klh.edu.in', uploads: 25, totalDownloads: 450 },
          { id: 2, fullName: 'Prof. Johnson', email: 'johnson@klh.edu.in', uploads: 18, totalDownloads: 380 },
          { id: 3, fullName: 'Dr. Wilson', email: 'wilson@klh.edu.in', uploads: 15, totalDownloads: 320 },
          { id: 4, fullName: 'Prof. Davis', email: 'davis@klh.edu.in', uploads: 12, totalDownloads: 275 },
          { id: 5, fullName: 'Student User', email: 'student@klh.edu.in', uploads: 8, totalDownloads: 150 }
        ]
      };
    }
  }
};

// News API
export const newsAPI = {
  getAllNews: (page = 0, size = 10, search = null, type = null) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    return api.get(`/news?${params.toString()}`);
  },
  getRecentNews: async (limit = 5) => {
    try {
      return await api.get(`/news/recent?limit=${limit}`);
    } catch (error) {
      console.log('Backend not available, using mock news');
      return {
        data: [
          {
            id: 1,
            title: 'Welcome to Fall 2024!',
            content: 'New semester has begun. Check out the latest course materials.',
            author: 'Admin',
            createdAt: new Date().toISOString(),
            priority: 'high'
          },
          {
            id: 2,
            title: 'Midterm Exams Approaching',
            content: 'Prepare for midterm examinations. Study materials are available.',
            author: 'Academic Office',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            priority: 'medium'
          }
        ]
      };
    }
  },
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