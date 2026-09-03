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

  // Question Bank operations
  getQuestionBank: () => apiRequest('/admin/question-bank'),
  createBankQuestion: (data: any) =>
    apiRequest('/admin/question-bank', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBankQuestion: (id: string, data: any) =>
    apiRequest(`/admin/question-bank/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBankQuestion: (id: string) =>
    apiRequest(`/admin/question-bank/${id}`, {
      method: 'DELETE',
    }),

  // Manual multi-subject mock test creation & access key generator
  manualCreateMockTest: (data: {
    title: string;
    description?: string;
    subject_ids?: string[];
    duration_mins?: number;
    max_marks?: number;
    passing_marks?: number;
    negative_marking?: boolean;
    selected_bank_question_ids: string[];
  }) =>
    apiRequest('/admin/mock-tests/manual-create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateMockTestAccessKey: (mockTestId: string) =>
    apiRequest(`/admin/mock-tests/${mockTestId}/generate-key`, {
      method: 'POST',
    }),
};
