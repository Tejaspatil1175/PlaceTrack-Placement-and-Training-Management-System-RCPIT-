import apiClient from './client';

/**
 * List all notifications (TPO & Coordinator)
 */
export const getNotificationsApi = async (params) => {
  const response = await apiClient.get('/notifications', { params });
  return response.data;
};

/**
 * List personal/department-scoped notifications for logged-in user (All roles)
 */
export const getMyNotificationsApi = async () => {
  const response = await apiClient.get('/notifications/me');
  return response.data;
};

/**
 * Broadcast announcement/notification (TPO & Coordinator)
 * @param {Object} data - { title, message, targetType, targetDepartmentId, type, sendEmailBroadcast }
 */
export const createNotificationApi = async (data) => {
  const response = await apiClient.post('/notifications', data);
  return response.data;
};
