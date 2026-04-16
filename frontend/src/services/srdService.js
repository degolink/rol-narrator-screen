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
};
