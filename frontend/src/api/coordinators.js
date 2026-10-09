import apiClient from './client';

/**
 * Fetch all department coordinators (TPO & Coordinator)
 */
export const getCoordinatorsApi = async () => {
  const response = await apiClient.get('/users/coordinators');
  return response.data;
};

/**
 * Create/provision a new coordinator account (TPO only)
 * @param {Object} data - { name, email, phone, departmentId, password }
 */
export const createCoordinatorApi = async (data) => {
  const response = await apiClient.post('/users/coordinator', data);
  return response.data;
};

/**
 * Update an existing coordinator (TPO only)
 */
export const updateCoordinatorApi = async (id, data) => {
  const response = await apiClient.put(`/users/coordinator/${id}`, data);
  return response.data;
};

/**
 * Delete/deactivate a coordinator account (TPO only)
 */
export const deleteCoordinatorApi = async (id) => {
  const response = await apiClient.delete(`/users/coordinator/${id}`);
  return response.data;
};
