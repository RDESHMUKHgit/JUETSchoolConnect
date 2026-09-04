import { apiRequest } from './client.js';

export const teacherApi = {
  completeProfile: (data: {
    full_name?: string;
    phone?: string;
    teachers_emp_id?: string;
    designation?: string;
    department?: string;
    qualification?: string;
    specialization?: string;
    dob?: string;
    gender?: string;
    profile_photo_url?: string;
  }) =>
    apiRequest('/teacher/profile-setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudents: () => apiRequest('/teacher/students'),

  bulkRegisterStudents: (students: Array<{ name: string; email: string }>) =>
    apiRequest('/teacher/students/bulk-register', {
      method: 'POST',
      body: JSON.stringify({ students }),
    }),

  getPendingStudents: (pageOrParams?: number | { page?: number; limit?: number }, limitArg?: number) => {
    let page: number | undefined;
    let limit: number | undefined;
    if (typeof pageOrParams === 'object' && pageOrParams !== null) {
      page = pageOrParams.page;
      limit = pageOrParams.limit;
    } else {
      page = pageOrParams;
      limit = limitArg;
    }
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const qs = params.toString();
    return apiRequest(`/teacher/students/pending${qs ? `?${qs}` : ''}`);
  },

  verifyStudent: (studentId: string) =>
    apiRequest(`/teacher/students/${studentId}/verify`, {
      method: 'PUT',
    }),

  rejectStudent: (studentId: string) =>
    apiRequest(`/teacher/students/${studentId}/reject`, {
      method: 'PUT',
    }),

  manualAddStudent: (data: { fullName: string; email: string }) =>
    apiRequest('/teacher/students/manual-add', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStudentStatus: (studentId: string, status: 'ACTIVE' | 'SUSPENDED') =>
    apiRequest(`/teacher/students/${studentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getStudentDiagnostic: (studentId: string) => apiRequest(`/teacher/students/${studentId}/diagnostic`),
};
