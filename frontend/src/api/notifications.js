import apiClient from './client';

export const getNotificationsApi = async (params) => {
  const response = await apiClient.get('/notifications', { params });
  return response.data;
};

export const createNotificationApi = async (data) => {
  const response = await apiClient.post('/notifications', data);
  return response.data;
};
