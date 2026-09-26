import { api } from './api';

const analysisPromises = new Map<string, Promise<any>>();

export const analyzeFarm = (farmId: string, data?: any) => {
  if (analysisPromises.has(farmId)) {
    return analysisPromises.get(farmId)!;
  }

  const promise = api.post(`/farms/${farmId}/analyze`)
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
