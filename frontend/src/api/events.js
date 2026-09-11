import apiClient from './client';

export const getEventsApi = async (params) => {
  const response = await apiClient.get('/events', { params });
  return response.data;
};

export const createEventApi = async (data) => {
  const response = await apiClient.post('/events', data);
  return response.data;
};
