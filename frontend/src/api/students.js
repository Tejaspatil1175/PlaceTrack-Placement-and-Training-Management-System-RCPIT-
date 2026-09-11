import apiClient from './client';

export const getStudentsApi = async (params) => {
  const response = await apiClient.get('/students', { params });
  return response.data;
};

export const getStudentByIdApi = async (id) => {
  const response = await apiClient.get(`/students/${id}`);
  return response.data;
};

export const updateStudentProfileApi = async (id, data) => {
  const response = await apiClient.put(`/students/${id}/profile`, data);
  return response.data;
};

export const bulkUploadStudentsApi = async (formData) => {
  const response = await apiClient.post('/students/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getStudentAcademicsApi = async (id = 'me') => {
  const response = await apiClient.get(`/students/${id}/academics`);
  return response.data;
};

