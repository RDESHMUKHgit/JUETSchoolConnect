/**
 * Client Exam Session Storage Utility
 * Manages active exam state in localStorage for crash recovery,
 * answer persistence, and tamper-resistant countdown timer.
 */

export interface ExamAnswerState {
  selectedOptionKey: string | null;
  isMarkedForReview: boolean;
  visited: boolean;
  timeSpentSeconds: number;
}

export interface StoredExamSession {
  testId: string;
  studentId: string;
  startedAt: number; // Unix timestamp (ms) when exam commenced
  durationMinutes: number;
  answers: Record<string, ExamAnswerState>;
  currentQuestionIndex: number;
}

export type QuestionStatus = 'not_visited' | 'unanswered' | 'attempted' | 'mark_for_review';

const PREFIX = 'jaypee_exam_session_';

export const getExamStorageKey = (testId: string): string => {
  return `${PREFIX}${testId}`;
};

/**
 * Retrieve saved exam session from localStorage
 */
export const getStoredExamSession = (testId: string): StoredExamSession | null => {
  try {
    const raw = localStorage.getItem(getExamStorageKey(testId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredExamSession;
  } catch (err) {
    console.error('Failed to parse stored exam session:', err);
    return null;
  }
};

/**
 * Initialize or restore an exam session.
 * If already active, returns existing session to preserve timer and answers.
 */
export const initExamSession = (
  testId: string,
  studentId: string,
  durationMinutes: number,
  questionIds: string[]
): StoredExamSession => {
  const existing = getStoredExamSession(testId);
  if (existing && existing.studentId === studentId) {
    // Ensure all questionIds are represented
    questionIds.forEach((qId, idx) => {
      if (!existing.answers[qId]) {
        existing.answers[qId] = {
          selectedOptionKey: null,
          isMarkedForReview: false,
          visited: idx === 0,
          timeSpentSeconds: 0,
        };
      }
    });
    saveExamSession(existing);
    return existing;
  }

  const initialAnswers: Record<string, ExamAnswerState> = {};
  questionIds.forEach((qId, idx) => {
    initialAnswers[qId] = {
      selectedOptionKey: null,
      isMarkedForReview: false,
      visited: idx === 0, // First question is visited by default
      timeSpentSeconds: 0,
    };
  });

  const session: StoredExamSession = {
    testId,
    studentId,
    startedAt: Date.now(),
    durationMinutes,
    answers: initialAnswers,
    currentQuestionIndex: 0,
  };

  saveExamSession(session);
  return session;
};

/**
 * Persist current state to localStorage
 */
export const saveExamSession = (session: StoredExamSession): void => {
  try {
    localStorage.setItem(getExamStorageKey(session.testId), JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save exam session:', err);
  }
};

/**
 * Compute remaining time in seconds against original startedAt timestamp.
 * Refreshing page does NOT reset timer.
 */
export const getRemainingSeconds = (session: StoredExamSession): number => {
  const elapsedMs = Date.now() - session.startedAt;
  const totalMs = session.durationMinutes * 60 * 1000;
  const remainingMs = totalMs - elapsedMs;
  return Math.max(0, Math.floor(remainingMs / 1000));
};

/**
 * Determine display status for Question Palette (4 distinct states)
 */
export const getQuestionStatus = (state?: ExamAnswerState): QuestionStatus => {
  if (!state || !state.visited) return 'not_visited';
  if (state.isMarkedForReview) return 'mark_for_review';
  if (state.selectedOptionKey !== null && state.selectedOptionKey !== '') return 'attempted';
  return 'unanswered';
};

/**
 * Update selected answer for a question
 */
export const recordAnswer = (
  testId: string,
  questionId: string,
  selectedKey: string | null
): StoredExamSession | null => {
  const session = getStoredExamSession(testId);
  if (!session) return null;

  const current = session.answers[questionId] || {
    selectedOptionKey: null,
    isMarkedForReview: false,
    visited: true,
    timeSpentSeconds: 0,
  };

  session.answers[questionId] = {
    ...current,
    selectedOptionKey: selectedKey,
    visited: true,
  };

  saveExamSession(session);
  return session;
};

/**
 * Toggle mark for review flag
 */
export const toggleMarkForReview = (testId: string, questionId: string): StoredExamSession | null => {
  const session = getStoredExamSession(testId);
  if (!session) return null;

  const current = session.answers[questionId] || {
    selectedOptionKey: null,
    isMarkedForReview: false,
    visited: true,
    timeSpentSeconds: 0,
  };

  session.answers[questionId] = {
    ...current,
    isMarkedForReview: !current.isMarkedForReview,
    visited: true,
  };

  saveExamSession(session);
  return session;
};

/**
 * Clear selected option for a question
 */
export const clearQuestionAnswer = (testId: string, questionId: string): StoredExamSession | null => {
  const session = getStoredExamSession(testId);
  if (!session) return null;

  const current = session.answers[questionId];
  if (current) {
    session.answers[questionId] = {
      ...current,
      selectedOptionKey: null,
    };
    saveExamSession(session);
  }
  return session;
};

/**
 * Mark question as visited when navigated to
 */
export const markQuestionVisited = (testId: string, questionId: string): StoredExamSession | null => {
  const session = getStoredExamSession(testId);
  if (!session) return null;

  const current = session.answers[questionId] || {
    selectedOptionKey: null,
    isMarkedForReview: false,
    visited: false,
    timeSpentSeconds: 0,
  };

  session.answers[questionId] = {
    ...current,
    visited: true,
  };

  saveExamSession(session);
  return session;
};

/**
 * Save active question index
 */
export const saveCurrentQuestionIndex = (testId: string, index: number): void => {
  const session = getStoredExamSession(testId);
  if (session) {
    session.currentQuestionIndex = index;
    saveExamSession(session);
  }
};

/**
 * Add dwell time in seconds to a specific question
 */
export const addQuestionTimeSpent = (testId: string, questionId: string, seconds: number): void => {
  if (seconds <= 0) return;
  const session = getStoredExamSession(testId);
  if (!session || !session.answers[questionId]) return;

  session.answers[questionId].timeSpentSeconds = (session.answers[questionId].timeSpentSeconds || 0) + seconds;
  saveExamSession(session);
};

/**
 * Retrieve map of question timings { [question_id]: seconds }
 */
export const getQuestionTimings = (testId: string): Record<string, number> => {
  const session = getStoredExamSession(testId);
  if (!session) return {};

  const timings: Record<string, number> = {};
  Object.entries(session.answers).forEach(([qId, state]) => {
    timings[qId] = state.timeSpentSeconds || 0;
  });
  return timings;
};

/**
 * Wipe session after successful submission
 */
export const clearExamSession = (testId: string): void => {
  try {
    localStorage.removeItem(getExamStorageKey(testId));
  } catch (err) {
    console.error('Failed to clear exam session:', err);
  }
};
