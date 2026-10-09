import apiClient from './client';

/**
 * Get all applications (TPO / Coordinator: all across college, Student: self)
 */
export const getApplicationsApi = async (params) => {
  const response = await apiClient.get('/applications', { params });
  return response.data;
};

/**
 * Get all applications submitted for a specific placement drive (TPO & Coordinator)
 */
export const getDriveApplicationsApi = async (driveId) => {
  const response = await apiClient.get(`/applications/drive/${driveId}`);
  return response.data;
};

/**
 * Get own applications list (Student only)
 */
export const getMyApplicationsApi = async () => {
  const response = await apiClient.get('/applications/me');
  return response.data;
};

/**
 * Apply to a placement drive (Student only)
 */
export const applyToDriveApi = async (driveIdOrObj) => {
  const driveId = typeof driveIdOrObj === 'object' ? driveIdOrObj?.driveId || driveIdOrObj?.id : driveIdOrObj;
  const response = await apiClient.post(`/applications/apply/${driveId}`);
  return response.data;
};

/**
 * Update candidate round status and trigger email notice (TPO & Coordinator)
 * @param {number|string} id - Application ID
 * @param {Object} data - { status: 'APPLIED'|'SHORTLISTED'|'REJECTED'|'ACCEPTED', notes?: string }
 */
export const updateApplicationStatusApi = async (id, data) => {
  let status = typeof data === 'string' ? data : data?.status;
  if (status) {
    status = status.toUpperCase();
    if (status === 'INTERVIEW') status = 'SHORTLISTED';
    if (status === 'SELECTED') status = 'ACCEPTED';
  }
  const payload = {
    status,
    notes: typeof data === 'object' ? data.notes : undefined,
  };
  const response = await apiClient.put(`/applications/${id}/status`, payload);
  return response.data;
};

/**
 * Bulk transition application round statuses (TPO & Coordinator)
 * @param {Object} data - { applicationIds: number[], status: string, notes?: string }
 */
export const bulkUpdateApplicationStatusApi = async (data) => {
  const response = await apiClient.post('/applications/bulk-status', data);
  return response.data;
};

/**
 * Get detailed application by ID
 */
export const getApplicationByIdApi = async (id) => {
  const response = await apiClient.get(`/applications/${id}`);
  return response.data;
};

