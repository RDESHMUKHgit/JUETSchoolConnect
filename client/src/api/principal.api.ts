import { apiRequest } from './client.js';

export const principalApi = {
  createTeacher: (data: { email: string; password: string }) =>
    apiRequest('/principal/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTeachers: () => apiRequest('/principal/teachers'),
  approveTeacher: (teacherId: string) =>
    apiRequest(`/principal/teachers/${teacherId}/approve`, {
      method: 'PUT',
    }),
  getStudents: () => apiRequest('/principal/students'),
  approveStudent: (studentId: string) =>
    apiRequest(`/principal/students/${studentId}/approve`, {
      method: 'PUT',
    }),
  getStats: () => apiRequest('/principal/stats'),
};
