import apiClient from './client';

export const getTpoAnalyticsApi = async () => {
  const response = await apiClient.get('/analytics/tpo');
  return response.data;
};

export const getCoordinatorAnalyticsApi = async () => {
  const response = await apiClient.get('/analytics/coordinator');
  return response.data;
};

export const downloadPlacementReportApi = async (params = {}) => {
  const response = await apiClient.get('/analytics/report/download', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

