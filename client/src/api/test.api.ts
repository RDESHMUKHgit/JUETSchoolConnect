import { apiRequest } from './client.js';

export const testApi = {
  getMockTests: () => apiRequest('/tests/mock-tests'),
  getMockTestDetails: (testId: string) => apiRequest(`/tests/mock-tests/${testId}`),
  getQuestionsForAttempt: (testId: string) => apiRequest(`/tests/mock-tests/${testId}/questions`),
  submitTestAttempt: (testId: string, data: { answers: Record<string, string>; time_taken: number }) =>
    apiRequest(`/tests/mock-tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: (studentId?: string) => apiRequest(`/tests/history${studentId ? `/${studentId}` : ''}`),
  getAttemptAnalysis: (attemptId: string) => apiRequest(`/tests/analysis/${attemptId}`),
};
