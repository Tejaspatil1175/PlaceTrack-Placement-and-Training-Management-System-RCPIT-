import apiClient from './client';

export const getApplicationsApi = async (params) => {
  const response = await apiClient.get('/applications', { params });
  return response.data;
};

export const applyToDriveApi = async (data) => {
  const response = await apiClient.post('/applications', data);
  return response.data;
};

export const updateApplicationStatusApi = async (id, status) => {
  const response = await apiClient.patch(`/applications/${id}/status`, { status });
  return response.data;
};
