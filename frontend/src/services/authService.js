import { api } from './apiService';

const TOKEN_KEY = 'rol_access_token';
const REFRESH_KEY = 'rol_refresh_token';
const USER_KEY = 'rol_user_data';

export const authService = {
  async requestMagicLink(email, username) {
    return api.post('/auth/magic-link/', { email, username });
  },

  async verifyMagicLink(token) {
    const response = await api.get(`/auth/verify/?token=${token}`);
    const { access, refresh, user } = response.data;

    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set default auth header for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    return user;
  },

  async getProfile() {
    const response = await api.get('/profile/me/');
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/profile/me/', data);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  async assignCharacter(characterId) {
    return api.post('/profile/assign_character/', { character_id: characterId });
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },

  getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  initTokens() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// Initialize tokens immediately on load to prevent race conditions during mount
authService.initTokens();