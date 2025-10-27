import { authAPI } from './api';
import { auth as fbAuth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const USE_FIREBASE = String(process.env.REACT_APP_USE_FIREBASE || '').toLowerCase() === 'true';

export const authService = {
  async login(email, password) {
    try {
      // Validate email domain
      if (!email.endsWith('@klh.edu.in')) {
        throw { response: { data: { error: 'Only @klh.edu.in email addresses are allowed to login' } } };
      }
      const response = await authAPI.login({ email, password });
      let accessToken = response.data.accessToken;
      let user = response.data.user;
      if (USE_FIREBASE && fbAuth?.currentUser) {
        accessToken = await fbAuth.currentUser.getIdToken();
        user = response.data.user || {
          id: fbAuth.currentUser.uid,
          name: fbAuth.currentUser.displayName,
          email: fbAuth.currentUser.email,
        };
      }
      if (accessToken) {
        localStorage.setItem('authToken', accessToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return { user, accessToken };
    } catch (error) {
      if (USE_FIREBASE) {
        throw { error: error.message };
      }
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
      let accessToken = response.data.accessToken;
      let user = response.data.user;
      if (USE_FIREBASE && fbAuth?.currentUser) {
        accessToken = await fbAuth.currentUser.getIdToken();
        user = response.data.user || {
          id: fbAuth.currentUser.uid,
          name: fbAuth.currentUser.displayName,
          email: fbAuth.currentUser.email,
        };
      }
      if (accessToken) localStorage.setItem('authToken', accessToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      return { user, accessToken };
    } catch (error) {
      if (USE_FIREBASE) {
        throw { error: error.message };
      }
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  async loginWithGoogle(idToken) {
    try {
      if (USE_FIREBASE) {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(fbAuth, credential);
        const accessToken = await result.user.getIdToken();
        const user = {
          id: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
        };
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, accessToken };
      }
      const response = await authAPI.googleLogin(idToken);
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { user: response.data.user, accessToken: response.data.accessToken };
    } catch (error) {
      if (USE_FIREBASE) {
        throw { error: error.message };
      }
      throw error.response?.data || { error: 'Google login failed' };
    }
  },

  async getCurrentUser() {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      if (USE_FIREBASE) {
        throw { error: error.message };
      }
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