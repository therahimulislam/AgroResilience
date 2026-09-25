import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
if (rawApiUrl.includes('onrender.com') && !rawApiUrl.endsWith('/api/v1')) {
  rawApiUrl = rawApiUrl.replace(/\/$/, '') + '/api/v1';
}
const API_URL = rawApiUrl;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
