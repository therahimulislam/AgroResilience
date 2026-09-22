import { api } from './api';

export const analyzeFarm = async (farmId: string) => {
  const response = await api.post(`/farms/${farmId}/analyze`);
  return response.data;
};
