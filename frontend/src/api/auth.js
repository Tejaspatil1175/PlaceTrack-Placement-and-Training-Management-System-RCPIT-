import apiClient from './client';

export const loginApi = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const getMeApi = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const resetPasswordApi = async (data) => {
  const response = await apiClient.post('/auth/reset-password', data);
  return response.data;
};
