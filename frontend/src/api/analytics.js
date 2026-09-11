import apiClient from './client';

export const getTpoAnalyticsApi = async () => {
  const response = await apiClient.get('/analytics/tpo');
  return response.data;
};

export const getCoordinatorAnalyticsApi = async () => {
  const response = await apiClient.get('/analytics/coordinator');
  return response.data;
};
