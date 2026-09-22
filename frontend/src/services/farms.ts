import { api } from './api';

export interface Farm {
  id: string;
  name: string;
  area_acres?: number;
  latitude?: number;
  longitude?: number;
  irrigation_type?: string;
  current_crop?: string;
  season?: string;
  sowing_date?: string;
}

export const getFarms = async () => {
  const response = await api.get('/farms');
  return response.data;
};

export const getFarm = async (id: string) => {
  const response = await api.get(`/farms/${id}`);
  return response.data;
};

export const createFarm = async (data: Partial<Farm> & { boundary_geojson?: string }) => {
  const response = await api.post('/farms', data);
  return response.data;
};

export const updateFarm = async (id: string, data: Partial<Farm> & { boundary_geojson?: string }) => {
  const response = await api.patch(`/farms/${id}`, data);
  return response.data;
};

export const deleteFarm = async (id: string) => {
  const response = await api.delete(`/farms/${id}`);
  return response.data;
};
