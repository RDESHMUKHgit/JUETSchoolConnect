import { apiRequest } from './client.js';

export const testApi = {
  getMockTests: (params?: {
    search?: string;
    subjects?: string;
    sortBy?: string;
    sortOrder?: string;
    duration?: number;
    minQuestions?: number;
    maxQuestions?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.subjects) query.append('subjects', params.subjects);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params?.duration) query.append('duration', String(params.duration));
    if (params?.minQuestions) query.append('minQuestions', String(params.minQuestions));
    if (params?.maxQuestions) query.append('maxQuestions', String(params.maxQuestions));

    const qs = query.toString();
    return apiRequest(`/tests/mock-tests${qs ? `?${qs}` : ''}`);
  },

  getMockTestDetails: (testId: string) => apiRequest(`/tests/mock-tests/${testId}`),

  getQuestionsForAttempt: (testId: string) => apiRequest(`/tests/mock-tests/${testId}/questions`),

  submitTestAttempt: (
    testId: string,
    data: {
      answers: Record<string, string>;
      time_taken: number;
      question_timings?: Record<string, number>;
    }
  ) =>
    apiRequest(`/tests/mock-tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: (studentIdOrOpts?: string | { studentId?: string; limit?: number }, limit?: number) => {
    let studentId: string | undefined;
    let actualLimit: number | undefined = limit;
    if (typeof studentIdOrOpts === 'object' && studentIdOrOpts !== null) {
      studentId = studentIdOrOpts.studentId;
      actualLimit = studentIdOrOpts.limit;
    } else {
      studentId = studentIdOrOpts;
    }
    const qs = actualLimit ? `?limit=${actualLimit}` : '';
    return apiRequest(`/tests/history${studentId ? `/${studentId}` : ''}${qs}`);
  },

  getAttemptAnalysis: (attemptId: string) => apiRequest(`/tests/analysis/${attemptId}`),

  validateAccessKey: (testId: string, accessKey: string) =>
    apiRequest(`/tests/mock-tests/${testId}/validate-key`, {
      method: 'POST',
      body: JSON.stringify({ accessKey }),
    }),

  getFullTestPaper: (testId: string) => apiRequest(`/tests/mock-tests/${testId}/full-paper`),

  getMockTestLeaderboard: (testId: string) => apiRequest(`/tests/leaderboard/mock-test/${testId}`),

  getSchoolOverallLeaderboard: () => apiRequest('/tests/leaderboard/school'),
};
