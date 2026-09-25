import axios from 'axios';

export const analyzeFarm = async (data: any) => {
  // Use VITE_API_URL but replace /api/v1 with /api/intelligence/analyze since main.py defines it at /api/intelligence/analyze
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const url = baseUrl.replace('/api/v1', '') + '/api/intelligence/analyze';
  
  const token = localStorage.getItem('token');
  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return response.data;
};
