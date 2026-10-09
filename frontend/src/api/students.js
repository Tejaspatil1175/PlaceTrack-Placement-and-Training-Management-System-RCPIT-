import apiClient from './client';

/**
 * List all students or filter by params
 */
export const getStudentsApi = async (params) => {
  const response = await apiClient.get('/students', { params });
  return response.data;
};

/**
 * Get student details by ID
 */
export const getStudentByIdApi = async (id) => {
  const response = await apiClient.get(`/students/${id}`);
  return response.data;
};

/**
 * Provision an individual student (TPO & Coordinator)
 * @param {Object} data - { name, email, prn, branch, division, admissionYear, currentSemester, phone }
 */
export const createStudentApi = async (data) => {
  const response = await apiClient.post('/students', data);
  return response.data;
};

/**
 * Update own student profile (skills, address, phone, certifications)
 */
export const updateStudentProfileApi = async (id, data) => {
  const response = await apiClient.put('/students/me', data);
  return response.data;
};

/**
 * Upload student resume PDF to Cloudinary (Student only)
 * @param {FormData} formData - multipart form data with 'resume' field
 */
export const uploadResumeApi = async (formData) => {
  const response = await apiClient.post('/students/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Bulk upload students via Excel sheet (TPO & Coordinator)
 * @param {FormData} formData - multipart form data with 'file' field
 * @param {boolean} [isDelta=false] - if true, delta semester upsert
 */
export const bulkUploadStudentsApi = async (formData, isDelta = false) => {
  const url = isDelta ? '/students/bulk-upload?mode=delta' : '/students/bulk-upload';
  const response = await apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Download the official PlaceTrack Excel ingestion template (.xlsx)
 */
export const downloadTemplateApi = async () => {
  const response = await apiClient.get('/students/template', {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * View audit history and error logs of past Excel uploads (TPO & Coordinator)
 */
export const getUploadLogsApi = async () => {
  const response = await apiClient.get('/students/upload-logs');
  return response.data;
};

/**
 * Fetch 8-semester academic transcript (Student self or scoped ID)
 */
export const getStudentAcademicsApi = async (id = 'me') => {
  const response = await apiClient.get(`/students/${id}/academics`);
  return response.data;
};

/**
 * Manual semester record correction (TPO & Coordinator)
 * @param {number|string} studentId - Student profile ID
 * @param {number} semesterNum - Semester number (1-8)
 * @param {Object} data - { sgpa, credits, newBacklogs, clearedBacklogs }
 */
export const updateSemesterRecordApi = async (studentId, semesterNum, data) => {
  const response = await apiClient.put(`/students/${studentId}/semester/${semesterNum}`, data);
  return response.data;
};
