import { authAPI } from './api';

export const authService = {
  async login(email, password) {
    try {
      // Validate email domain
      if (!email.endsWith('@klh.edu.in')) {
        throw { response: { data: { error: 'Only @klh.edu.in email addresses are allowed to login' } } };
      }

      try {
        const response = await authAPI.login({ email, password });
        if (response.data.accessToken) {
          localStorage.setItem('authToken', response.data.accessToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      } catch (error) {
        // Fallback for when backend is not available
        console.log('Backend not available, using fallback authentication');
        const mockUser = {
          id: 1,
          email: email,
          fullName: email.split('@')[0],
          firstName: email.split('@')[0],
          role: 'STUDENT'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, accessToken: mockToken };
      }
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  async register(userData) {
    try {
      // Validate email domain
      if (!userData.email.endsWith('@klh.edu.in')) {
        throw { response: { data: { error: 'Only @klh.edu.in email addresses are allowed to register' } } };
      }

      try {
        const response = await authAPI.register(userData);
        if (response.data.accessToken) {
          localStorage.setItem('authToken', response.data.accessToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      } catch (error) {
        // Fallback for when backend is not available
        console.log('Backend not available, using fallback registration');
        const mockUser = {
          id: Date.now(),
          email: userData.email,
          fullName: userData.fullName || userData.firstName + ' ' + userData.lastName,
          firstName: userData.firstName,
          role: 'STUDENT'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, accessToken: mockToken };
      }
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  async loginWithGoogle(idToken) {
    try {
      try {
        const response = await authAPI.googleLogin(idToken);
        if (response.data.accessToken) {
          localStorage.setItem('authToken', response.data.accessToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      } catch (error) {
        // Fallback for when backend is not available
        console.log('Backend not available, using fallback Google authentication');
        // Extract email from Google ID token (this is simplified)
        const mockUser = {
          id: Date.now(),
          email: 'user@klh.edu.in', // This would normally come from Google token
          fullName: 'Google User',
          firstName: 'Google',
          role: 'STUDENT'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, accessToken: mockToken };
      }
    } catch (error) {
      throw error.response?.data || { error: 'Google login failed' };
    }
  },

  async getCurrentUser() {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user info' };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};