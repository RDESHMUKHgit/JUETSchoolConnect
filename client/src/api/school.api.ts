import { apiRequest } from './client.js';

export const schoolApi = {
  getVerifiedSchools: () => apiRequest('/schools/verified'),
  getTeachersForSchool: (schoolId: string) => apiRequest(`/schools/${schoolId}/teachers`),
  getTeachersBySchool: (schoolId: string) => apiRequest(`/schools/${schoolId}/teachers`),
  getSchoolProfile: (schoolId?: string) => apiRequest(`/schools/profile${schoolId ? `/${schoolId}` : ''}`),
  updateSchoolProfile: (data: any) =>
    apiRequest('/schools/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
