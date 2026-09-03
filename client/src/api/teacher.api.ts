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
  getStudentDiagnostic: (studentId: string) => apiRequest(`/teacher/students/${studentId}/diagnostic`),
};
