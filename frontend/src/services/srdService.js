import axios from 'axios';

const srdApi = axios.create({
  baseURL: '/dnd5e-api/api/2014',
});

export const srdService = {
  getClasses: async () => {
    const response = await srdApi.get('/classes');
    return response.data.results;
  },
  getRaces: async () => {
    const response = await srdApi.get('/races');
    return response.data.results;
  },
  getAlignments: async () => {
    const response = await srdApi.get('/alignments');
    return response.data.results;
  },
  getClass: async (index) => {
    const response = await srdApi.get(`/classes/${index}`);
    return response.data;
  },
  getRace: async (index) => {
    const response = await srdApi.get(`/races/${index}`);
    return response.data;
  },
  getAlignment: async (index) => {
    const response = await srdApi.get(`/alignments/${index}`);
    return response.data;
  },
};
