import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Mission API calls
export const missionAPI = {
  getMissions: (params = {}) => apiClient.get('/drone/missions', { params }),
  createMission: (data) => apiClient.post('/drone/missions', data),
  getMission: (id) => apiClient.get(`/drone/missions/${id}`),
  updateMission: (id, data) => apiClient.put(`/drone/missions/${id}`, data),
  deleteMission: (id) => apiClient.delete(`/drone/missions/${id}`),
  addDroneData: (id, data) => apiClient.post(`/drone/missions/${id}/data`, data),
  getAnalytics: (id) => apiClient.get(`/drone/missions/${id}/analytics`),
};

// Weather API calls  
export const weatherAPI = {
  getCurrentWeather: (lat, lon) => apiClient.get('/weather/current', { params: { lat, lon } }),
  getForecast: (lat, lon, days = 5) => apiClient.get('/weather/forecast', { params: { lat, lon, days } }),
  getAlerts: (lat, lon) => apiClient.get('/weather/alerts', { params: { lat, lon } }),
};

// AI API calls
export const aiAPI = {
  chat: (message, context = {}) => apiClient.post('/ai/chat', { message, context }),
  analyzeImage: (imageUrl, analysisType, missionId) => 
    apiClient.post('/ai/analyze-image', { imageUrl, analysisType, missionId }),
  generateReport: (missionId, reportType) => 
    apiClient.post('/ai/generate-report', { missionId, reportType }),
  getInsights: () => apiClient.get('/ai/insights'),
};

// Maps API calls
export const mapsAPI = {
  geocode: (address) => apiClient.get('/maps/geocode', { params: { address } }),
  reverseGeocode: (lat, lng) => apiClient.get('/maps/reverse-geocode', { params: { lat, lng } }),
  validateFlightPath: (path) => apiClient.post('/maps/validate-flight-path', { path }),
};

export default apiClient;