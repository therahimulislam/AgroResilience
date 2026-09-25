import axios from 'axios';

const analysisPromises = new Map<string, Promise<any>>();

export const analyzeFarm = (farmId: string, data: any) => {
  if (analysisPromises.has(farmId)) {
    return analysisPromises.get(farmId)!;
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const url = baseUrl.replace('/api/v1', '') + '/api/intelligence/analyze';
  const token = localStorage.getItem('token');
  
  const promise = axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
  .then(res => {
    localStorage.setItem(`analysis_${farmId}`, JSON.stringify(res.data));
    analysisPromises.delete(farmId);
    return res.data;
  })
  .catch(err => {
    analysisPromises.delete(farmId);
    throw err;
  });

  analysisPromises.set(farmId, promise);
  return promise;
};

export const getCachedAnalysis = (farmId: string) => {
  const cached = localStorage.getItem(`analysis_${farmId}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const hasActiveAnalysis = (farmId: string) => {
  return analysisPromises.has(farmId);
};
