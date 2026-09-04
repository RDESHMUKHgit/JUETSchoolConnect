import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { useAuth } from '../../context/AuthContext.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { Button } from '../../components/ui/Button.js';
import { MobileAppQrGate } from '../../components/common/MobileAppQrGate.js';
import { ExamSecurityShield } from '../../components/exam/ExamSecurityShield.js';
import { ExamHeader } from '../../components/exam/ExamHeader.js';
import { ExamQuestionArea } from '../../components/exam/ExamQuestionArea.js';
import { ExamQuestionPalette } from '../../components/exam/ExamQuestionPalette.js';
import { ExamControls } from '../../components/exam/ExamControls.js';
import { ExamSubmitModal } from '../../components/exam/ExamSubmitModal.js';
import {
  initExamSession,
  getStoredExamSession,
  recordAnswer,
  toggleMarkForReview,
  clearQuestionAnswer,
  markQuestionVisited,
  saveCurrentQuestionIndex,
  clearExamSession,
  addQuestionTimeSpent,
  getQuestionTimings,
  ExamAnswerState,
} from '../../utils/examStorage.js';

export const TestRunnerEngine: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswerState>>({});
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Result state
  const [result, setResult] = useState<any | null>(null);

  // Per-question dwell time tracking
  const questionStartTimeRef = React.useRef<number>(Date.now());

  // 1. Initialize Test & Questions
  useEffect(() => {
    async function initialize() {
      if (!testId) return;
      try {
        setLoading(true);
        const [testRes, qRes] = await Promise.all([
          testApi.getMockTestDetails(testId),
          testApi.getQuestionsForAttempt(testId),
        ]);

        if (!testRes.success || !testRes.mockTest) {
          throw new Error(testRes.message || 'Mock test details unavailable.');
        }

        const currentTest = testRes.mockTest;
        const currentQuestions = qRes.questions || [];
        setTest(currentTest);
        setQuestions(currentQuestions);

        // Initialize or restore session from localStorage
        const qIds = currentQuestions.map((q: any) => q.question_id);
        const session = initExamSession(
          testId,
          user?.userId || 'anonymous_student',
          currentTest.max_time_in_mins || 60,
          qIds
        );

        setAnswers(session.answers);
        setStartedAt(session.startedAt);
        setCurrentIndex(session.currentQuestionIndex || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize examination environment.');
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, [testId, user?.userId]);

  // 2. Final Submit Handler (called manually or automatically when timer expires)
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting || !testId) return;

    try {
      setIsSubmitting(true);
      const session = getStoredExamSession(testId);
      const currentAnswers = session ? session.answers : answers;

      // Extract answers map for backend: { [question_id]: option_key }
      const answersMap: Record<string, string> = {};
      Object.entries(currentAnswers).forEach(([qId, state]) => {
        if (state.selectedOptionKey) {
          answersMap[qId] = state.selectedOptionKey;
        }
      });

      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

      // Flush dwell time for currently active question
      const activeQ = questions[currentIndex];
      if (activeQ?.question_id) {
        const dwellSec = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
        addQuestionTimeSpent(testId, activeQ.question_id, dwellSec);
      }
      const questionTimings = getQuestionTimings(testId);

      const res = await testApi.submitTestAttempt(testId, {
        answers: answersMap,
        time_taken: elapsedSeconds,
        question_timings: questionTimings,
      });

      if (res.success && res.result) {
        // Clear stored attempt upon successful submission
        clearExamSession(testId);
        sessionStorage.removeItem(`exam_auth_key_${testId}`);
        setResult(res.result);
        setSubmitConfirmOpen(false);
      } else {
        throw new Error(res.message || 'Submission failed.');
      }
    } catch (err: any) {
      alert('Error during submission: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [testId, isSubmitting, startedAt, answers]);

  // 3. Auto-Submit on Time Expiry
  const handleTimeUp = useCallback(() => {
    setAutoSubmitted(true);
    setSubmitConfirmOpen(true);
    handleFinalSubmit();
  }, [handleFinalSubmit]);

  // Option selection
  const handleSelectOption = (optionKey: string) => {
    const qId = questions[currentIndex]?.question_id;
    if (!qId || !testId) return;

    const updated = recordAnswer(testId, qId, optionKey);
    if (updated) setAnswers({ ...updated.answers });
  };

  // Toggle review & go to next
  const handleToggleReviewAndNext = () => {
    const qId = questions[currentIndex]?.question_id;
    if (!qId || !testId) return;

    const updated = toggleMarkForReview(testId, qId);
    if (updated) setAnswers({ ...updated.answers });

    if (currentIndex < questions.length - 1) {
      handleNavigate(currentIndex + 1);
    }
  };

  // Clear answer
  const handleClearAnswer = () => {
    const qId = questions[currentIndex]?.question_id;
    if (!qId || !testId) return;

    const updated = clearQuestionAnswer(testId, qId);
    if (updated) setAnswers({ ...updated.answers });
  };

  // Navigate question (Strictly forward-only: index >= currentIndex)
  const handleNavigate = (index: number) => {
    if (index < currentIndex || index >= questions.length || !testId) return;

    // Record dwell time for departing question
    const departingQ = questions[currentIndex];
    if (departingQ?.question_id) {
      const dwellSec = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
      addQuestionTimeSpent(testId, departingQ.question_id, dwellSec);
    }
    questionStartTimeRef.current = Date.now();

    const targetQId = questions[index]?.question_id;
    if (targetQId) {
      const updated = markQuestionVisited(testId, targetQId);
      if (updated) setAnswers({ ...updated.answers });
    }
    saveCurrentQuestionIndex(testId, index);
    setCurrentIndex(index);
  };

  if (loading) {
    return <LoadingSpinner message="Calibrating secure examination workspace..." />;
  }

  if (error && !test) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontSize: '16px', fontWeight: 600 }}>{error}</p>
        <Button variant="secondary" onClick={() => navigate('/student/mock-tests')} style={{ marginTop: '16px' }}>
          Back to Mock Tests
        </Button>
      </div>
    );
  }

  // 4. Result view with Mobile App QR Gate (Result and analysis in mobile app only)
  if (result) {
    return <MobileAppQrGate testTitle={test?.title} attemptId={result.attemptId} />;
  }

  const currentQ = questions[currentIndex] || {};
  const currentQId = currentQ.question_id;
  const currentState = answers[currentQId];
  const questionIds = questions.map((q) => q.question_id);

  // Subject list
  const subjectsList = test?.subject_names || (test?.subject?.name ? [test.subject.name] : ['Science']);

  return (
    <ExamSecurityShield>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {/* Anti-cheat sticky header */}
        <ExamHeader
          testTitle={test?.title || 'Class 12 Mock Examination'}
          subjects={subjectsList}
          durationMinutes={test?.max_time_in_mins || 60}
          startedAt={startedAt}
          studentName={user?.fullName || undefined}
          studentRoll={user?.email?.split('@')[0]}
          onTimeUp={handleTimeUp}
          onSubmitClick={() => setSubmitConfirmOpen(true)}
          submitting={isSubmitting}
        />

        {/* Main Body: Question Area + Right Side Question Palette */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px)' }}>
            <ExamQuestionArea
              question={currentQ}
              questionIndex={currentIndex}
              totalQuestions={questions.length}
              selectedOptionKey={currentState?.selectedOptionKey || null}
              onSelectOption={handleSelectOption}
            />

            <ExamControls
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              isMarkedForReview={Boolean(currentState?.isMarkedForReview)}
              hasSelectedOption={Boolean(currentState?.selectedOptionKey)}
              onNext={() => {
                if (currentIndex === questions.length - 1) {
                  setSubmitConfirmOpen(true);
                } else {
                  handleNavigate(currentIndex + 1);
                }
              }}
              onClear={handleClearAnswer}
              onToggleReviewAndNext={handleToggleReviewAndNext}
            />
          </div>

          <ExamQuestionPalette
            totalQuestions={questions.length}
            questionIds={questionIds}
            answers={answers}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Submit Confirmation Modal */}
        <ExamSubmitModal
          isOpen={submitConfirmOpen}
          onClose={() => setSubmitConfirmOpen(false)}
          onConfirmSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
          totalQuestions={questions.length}
          questionIds={questionIds}
          answers={answers}
          autoSubmitted={autoSubmitted}
        />
      </div>
    </ExamSecurityShield>
  );
};
