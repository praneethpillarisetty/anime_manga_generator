import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Script Management
export const scriptAPI = {
  parseScript: async (scriptData) => {
    try {
      const response = await apiClient.post('/scripts/parse', scriptData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to parse script');
    }
  },

  getScripts: async () => {
    try {
      const response = await apiClient.get('/scripts');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch scripts');
    }
  },

  getScript: async (scriptId) => {
    try {
      const response = await apiClient.get(`/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch script');
    }
  },
};

// Character Management
export const characterAPI = {
  createCharacter: async (characterData) => {
    try {
      const response = await apiClient.post('/characters', characterData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create character');
    }
  },

  getCharacters: async () => {
    try {
      const response = await apiClient.get('/characters');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch characters');
    }
  },

  deleteCharacter: async (characterId) => {
    try {
      const response = await apiClient.delete(`/characters/${characterId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete character');
    }
  },
};

// Manga Generation
export const generationAPI = {
  generatePanel: async (sceneData, style = 'shounen') => {
    try {
      const response = await apiClient.post('/generate/panel', { scene_data: sceneData, style });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to generate panel');
    }
  },

  startMangaGeneration: async (scriptId, style = 'shounen', options = {}) => {
    try {
      const response = await apiClient.post('/generate/manga', {
        script_id: scriptId,
        style,
        options
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to start manga generation');
    }
  },

  getGenerationStatus: async (jobId) => {
    try {
      const response = await apiClient.get(`/generate/status/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get generation status');
    }
  },
};

// Error handler for API responses
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.detail || error.response.data?.message || 'Server error';
    return { error: true, message, status: error.response.status };
  } else if (error.request) {
    // Request made but no response
    return { error: true, message: 'Network error - please check your connection', status: 0 };
  } else {
    // Something else happened
    return { error: true, message: error.message || 'An unexpected error occurred', status: 0 };
  }
};

export default apiClient;