import apiClient from './client';

export const getDrivesApi = async (params) => {
  const response = await apiClient.get('/drives', { params });
  return response.data;
};

export const getDriveByIdApi = async (id) => {
  const response = await apiClient.get(`/drives/${id}`);
  return response.data;
};

export const createDriveApi = async (data) => {
  const response = await apiClient.post('/drives', data);
  return response.data;
};

export const updateDriveApi = async (id, data) => {
  const response = await apiClient.put(`/drives/${id}`, data);
  return response.data;
};

export const deleteDriveApi = async (id) => {
  const response = await apiClient.delete(`/drives/${id}`);
  return response.data;
};

export const getEligibleStudentsApi = async (driveId) => {
  const response = await apiClient.get(`/drives/${driveId}/eligible-students`);
  return response.data;
};
