import { apiRequest } from './client.js';
import { UserRole } from '../types/index.js';

export const authApi = {
  registerPrincipalInit: (data: { full_name: string; email: string; password: string }) =>
    apiRequest('/auth/register-principal-init', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completePrincipalProfile: (data: { phone?: string; gender?: string; designation?: string; profile_photo_url?: string }) =>
    apiRequest('/auth/complete-principal-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitSchoolDetails: (data: any) =>
    apiRequest('/auth/submit-school', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerStudentInit: (data: { full_name: string; email: string; password: string }) =>
    apiRequest('/auth/register-student-init', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeStudentProfile: (data: any) =>
    apiRequest('/auth/complete-student-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string; role: UserRole }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminLogin: (data: { email: string; password: string }) =>
    apiRequest('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiRequest('/auth/me'),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};
