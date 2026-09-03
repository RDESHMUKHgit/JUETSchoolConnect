import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  Clock,
  CheckCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  Send,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MobileAppQrGate } from '../../components/common/MobileAppQrGate.js';

export const TestRunnerEngine: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Post-submission result state
  const [result, setResult] = useState<any | null>(null);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 1. Fetch test details and safe questions (answers stripped)
  useEffect(() => {
    async function initTest() {
      if (!testId) return;
      try {
        setLoading(true);
        const [testRes, qRes] = await Promise.all([
          testApi.getMockTestDetails(testId),
          testApi.getQuestionsForAttempt(testId),
        ]);

        if (testRes.success && testRes.mockTest) {
          setTest(testRes.mockTest);
          const durationSeconds = (testRes.mockTest.max_time_in_mins || 60) * 60;
          setTimeLeft(durationSeconds);
        }

        if (qRes.success && qRes.questions) {
          setQuestions(qRes.questions);
        } else {
          setQuestions([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize test attempt.');
      } finally {
        setLoading(false);
      }
    }
    initTest();
  }, [testId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, result, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleToggleReview = (questionId: string) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleClearResponse = (questionId: string) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      clearInterval(timerRef.current);

      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Submit attempt
      const res = await testApi.submitTestAttempt(testId!, {
        answers: selectedAnswers,
        time_taken: elapsedSeconds,
      });

      if (res.success && res.result) {
        setResult(res.result);
        setSubmitConfirmOpen(false);

        // Confetti celebration if score >= 80%
        if (res.result.percentage >= 80) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit test attempt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calibrating secure test attempt engine..." />;
  }

  if (error && !test) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#EF4444' }}>{error}</p>
        <Button variant="secondary" onClick={() => navigate('/student/mock-tests')} style={{ marginTop: '16px' }}>
          Return to Mock Tests
        </Button>
      </div>
    );
  }

  // 3. RESULT VIEW AFTER SUBMISSION (Mobile App QR Gated)
  if (result) {
    return <MobileAppQrGate testTitle={test?.title} attemptId={result.attemptId} />;
  }

  // 4. LIVE TEST TAKING RUNNER INTERFACE
  const currentQ = questions[currentIndex] || {};
  const currentQId = currentQ.question_id;
  const currentSelected = selectedAnswers[currentQId];
  const isMarked = Boolean(markedForReview[currentQId]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const isTimeCritical = timeLeft < 300; // less than 5 minutes

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Top Test Control Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#9A751A', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {test?.subject?.name || 'Class 12 Assessment'}
          </span>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {test?.title}
          </h2>
        </div>

        {/* Live Countdown Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: isTimeCritical ? '#FEF2F2' : '#FEFCE8',
            border: isTimeCritical ? '1px solid #FECACA' : '1px solid #FEF08A',
            color: isTimeCritical ? '#DC2626' : '#854D0E',
            fontWeight: 700,
            fontSize: '18px',
          }}
        >
          <Clock size={20} style={{ animation: isTimeCritical ? 'pulseGold 1s infinite' : 'none' }} />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Submit Button Trigger */}
        <Button
          variant="gold"
          size="sm"
          icon={<Send size={15} />}
          onClick={() => setSubmitConfirmOpen(true)}
        >
          Submit Test
        </Button>
      </header>

      {/* Test Runner Body: Split into Question Viewer & Question Palette */}
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', padding: '24px', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Left Column: Active Question Workspace */}
        <div style={{ flex: '1 1 650px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card variant="glass" padding="lg" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#9A751A' }}>
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge variant="default" size="sm">+{currentQ.marks_per_question || 4} Marks</Badge>
                  {test?.negative_marking && (
                    <Badge variant="danger" size="sm">-{currentQ.negative_marking || 1} Neg</Badge>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p style={{ fontSize: '17px', color: '#0F172A', lineHeight: 1.7, marginBottom: '28px', fontWeight: 500 }}>
                {currentQ.question_text}
              </p>

              {/* Option Radio Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQ.option_array?.map((opt: any) => {
                  const isChecked = currentSelected === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQId, opt.key)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        border: isChecked ? '1.5px solid #C59B27' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#FEFCE8' : '#FFFFFF',
                        color: isChecked ? '#0F172A' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: isChecked ? 'none' : '1px solid #CBD5E1',
                          backgroundColor: isChecked ? '#C59B27' : '#F1F5F9',
                          color: isChecked ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          flexShrink: 0,
                        }}
                      >
                        {opt.key}
                      </div>
                      <span style={{ fontSize: '15px' }}>{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Clear, Review, Prev, Next */}
            <div
              style={{
                borderTop: '1px solid #E2E8F0',
                paddingTop: '20px',
                marginTop: '32px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Flag size={15} />}
                  onClick={() => handleToggleReview(currentQId)}
                  style={{ color: isMarked ? '#B45309' : 'inherit' }}
                >
                  {isMarked ? 'Unmark Review' : 'Mark for Review'}
                </Button>
                {currentSelected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<RotateCcw size={15} />}
                    onClick={() => handleClearResponse(currentQId)}
                  >
                    Clear Response
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="secondary"
                  size="md"
                  icon={<ArrowLeft size={16} />}
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  style={{ display: 'inline-flex', flexDirection: 'row-reverse' }}
                  icon={<ArrowRight size={16} />}
                >
                  Next Question
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Question Palette Navigation */}
        <div style={{ flex: '1 1 300px', maxWidth: '380px' }}>
          <Card variant="glass" padding="md" style={{ position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
              Question Palette
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {questions.map((q, idx) => {
                const isSelected = selectedAnswers[q.question_id] !== undefined;
                const isReview = markedForReview[q.question_id];
                const isCurrent = idx === currentIndex;

                let bg = '#F1F5F9';
                let color = '#475569';
                let border = '1px solid #E2E8F0';

                if (isCurrent) {
                  border = '2px solid #0284C7';
                  bg = '#F0F9FF';
                  color = '#0284C7';
                }
                if (isReview) {
                  bg = '#FEF3C7';
                  color = '#B45309';
                  border = '1px solid #F59E0B';
                } else if (isSelected) {
                  bg = '#059669';
                  color = '#FFFFFF';
                  border = 'none';
                }

                return (
                  <button
                    key={q.question_id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: bg,
                      color,
                      border,
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#059669' }} />
                <span>Answered: <strong>{answeredCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#F59E0B' }} />
                <span>Marked for Review: <strong>{markedCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#E2E8F0' }} />
                <span>Unanswered: <strong>{questions.length - answeredCount}</strong></span>
              </div>
            </div>

            <Button
              variant="gold"
              size="md"
              icon={<Send size={15} />}
              onClick={() => setSubmitConfirmOpen(true)}
              style={{ width: '100%', marginTop: '20px' }}
            >
              Submit Assessment
            </Button>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        title="Confirm Test Submission"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
            Are you sure you want to submit your test session? Once submitted, your answers will be evaluated instantaneously.
          </p>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: '#334155' }}>Total Questions: <strong>{questions.length}</strong></div>
            <div style={{ fontSize: '13px', color: '#059669' }}>Answered: <strong>{answeredCount}</strong></div>
            <div style={{ fontSize: '13px', color: '#D97706' }}>Review: <strong>{markedCount}</strong></div>
            <div style={{ fontSize: '13px', color: '#DC2626' }}>Unanswered: <strong>{questions.length - answeredCount}</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button
              variant="gold"
              loading={isSubmitting}
              onClick={handleFinalSubmit}
              style={{ flex: 1 }}
            >
              Confirm & Submit
            </Button>
            <Button
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => setSubmitConfirmOpen(false)}
              style={{ flex: 1 }}
            >
              Back to Test
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
