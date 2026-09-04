import { apiRequest } from './client.js';

export const teacherApi = {
  completeProfile: (data: {
    full_name: string;
    phone?: string;
    teachers_emp_id?: string;
    designation?: string;
    department?: string;
    qualification?: string;
    specialization?: string;
    dob?: string;
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

  getPendingStudents: () => apiRequest('/teacher/students/pending'),

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
