import { authAPI } from './api';

export const authService = {
  async login(email, password) {
    try {
      // Validate email domain
      if (!email.endsWith('@klh.edu.in')) {
        throw { response: { data: { error: 'Only @klh.edu.in email addresses are allowed to login' } } };
      }

      const response = await authAPI.login({ email, password });
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
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

      const response = await authAPI.register(userData);
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  async loginWithGoogle(idToken) {
    try {
      const response = await authAPI.googleLogin(idToken);
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
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