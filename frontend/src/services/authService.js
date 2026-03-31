import { api } from './apiService';

export const authService = {
  async requestMagicLink(email, username) {
    return api.post('/auth/magic-link/', { email, username });
  },

  async verifyMagicLink(token) {
    if (!token) {
      throw new Error('Token invalido');
    }

    const response = await api.get(`/auth/verify/?token=${token}`);
    const { user } = response.data;

    if (!user) {
      throw new Error('No se pudo traer la informacion del usuario');
    }

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

  async setActiveCharacter(characterId) {
    const response = await api.post('/profile/set_active_character/', {
      character_id: characterId,
    });
    return response.data;
  },

  async logout() {
    return await api.post('/auth/logout/');
  },
};
