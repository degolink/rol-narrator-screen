import { api } from './apiService';

const TOKEN_KEY = 'rol_access_token';
const REFRESH_KEY = 'rol_refresh_token';

export const authService = {
  async requestMagicLink(email, username) {
    return api.post('/auth/magic-link/', { email, username });
  },

  async verifyMagicLink(token) {
    if (!token) {
      throw new Error('Token invalido');
    }

    const response = await api.get(`/auth/verify/?token=${token}`);
    const { access, refresh, user } = response.data;

    if (!user) {
      throw new Error('No se pudo traer la informacion del usuario');
    }

    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);

    // Set default auth header for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    return user;
  },

  async getProfile() {
    const response = await api.get('/profile/me/');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/profile/me/', data);
    return response.data;
  },

  async assignCharacter(characterId) {
    return api.post('/profile/assign_character/', {
      character_id: characterId,
    });
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  initTokens() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
};

// Initialize tokens immediately on load to prevent race conditions during mount
authService.initTokens();
