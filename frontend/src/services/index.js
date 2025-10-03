import { authService } from './firebase/auth';
import { courseService } from './firebase/courses';
import { materialService } from './firebase/materials';
import { newsService } from './firebase/news';
import { userService } from './firebase/users';

// Re-export services with familiar names to maintain compatibility
export const authAPI = authService;
export const courseAPI = courseService;
export const materialAPI = materialService;
export const newsAPI = newsService;
export const userAPI = userService;

// Helper function to handle errors consistently
export const handleAPIError = (error) => {
  console.error('API Error:', error);

  if (error.code) {
    // Firebase specific errors
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'storage/unauthorized':
        return 'Unauthorized: You do not have permission to perform this action';
      case 'storage/canceled':
        return 'Upload canceled';
      default:
        return error.message || 'An unexpected error occurred';
    }
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

// Helper function for success responses
export const handleAPISuccess = (data, message = 'Operation completed successfully') => {
  return {
    success: true,
    data,
    message,
  };
};

export default {
  authAPI,
  courseAPI,
  materialAPI,
  newsAPI,
  userAPI,
  handleAPIError,
  handleAPISuccess
};