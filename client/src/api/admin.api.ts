import { apiRequest } from './client.js';

export const adminApi = {
  getPendingSchools: () => apiRequest('/admin/pending-schools'),
  approveSchool: (schoolId: string) =>
    apiRequest(`/admin/schools/${schoolId}/approve`, {
      method: 'PUT',
    }),
  rejectSchool: (schoolId: string, reason?: string) =>
    apiRequest(`/admin/schools/${schoolId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
  getAllSchools: (status?: string) =>
    apiRequest(`/admin/schools${status ? `?status=${status}` : ''}`),
  getPlatformMetrics: () => apiRequest('/admin/metrics'),
  createMockTest: (data: any) =>
    apiRequest('/admin/mock-tests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createQuestion: (data: any) =>
    apiRequest('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateMockTest: (data: { title?: string; subject?: string; duration_mins?: number; max_marks?: number; question_count?: number }) =>
    apiRequest('/admin/mock-tests/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
