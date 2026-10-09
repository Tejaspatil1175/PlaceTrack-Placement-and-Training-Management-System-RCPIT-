import apiClient from './client';

/**
 * List all college departments with assigned coordinators (TPO & Coordinator)
 */
export const getDepartmentsApi = async () => {
  const response = await apiClient.get('/departments');
  return response.data;
};

/**
 * Create a new academic department (TPO only)
 * @param {Object} data - { name: string }
 */
export const createDepartmentApi = async (data) => {
  const response = await apiClient.post('/departments', data);
  return response.data;
};

/**
 * View department students and their academic stats (TPO & Coordinator)
 */
export const getDepartmentStudentsApi = async (departmentId) => {
  const response = await apiClient.get(`/departments/${departmentId}/students`);
  return response.data;
};
