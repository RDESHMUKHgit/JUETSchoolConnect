import { apiRequest } from './client.js';

export const schoolApi = {
  getVerifiedSchools: () => apiRequest('/schools/verified'),
  getSchoolProfile: (schoolId?: string) => apiRequest(`/schools/profile${schoolId ? `/${schoolId}` : ''}`),
  updateSchoolProfile: (data: any) =>
    apiRequest('/schools/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
