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
  getAllSchools: (params?: { status?: string; search?: string } | string) => {
    if (typeof params === 'string') {
      return apiRequest(`/admin/schools${params ? `?status=${params}` : ''}`);
    }
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/schools${qs ? `?${qs}` : ''}`);
  },
  getSchoolHierarchy: (schoolId: string) => apiRequest(`/admin/schools/${schoolId}/hierarchy`),
  getTeacherStudents: (teacherId: string) => apiRequest(`/admin/teachers/${teacherId}/students`),
  getPlatformMetrics: () => apiRequest('/admin/metrics'),
  getDetailedPlatformMetrics: () => apiRequest('/admin/detailed-metrics'),
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
  getQuestionBank: (params?: { page?: number; limit?: number; subject?: string; search?: string; usage?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.subject) query.append('subject', params.subject);
    if (params?.search) query.append('search', params.search);
    if (params?.usage) query.append('usage', params.usage);
    const qs = query.toString();
    return apiRequest(`/admin/question-bank${qs ? `?${qs}` : ''}`);
  },
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
