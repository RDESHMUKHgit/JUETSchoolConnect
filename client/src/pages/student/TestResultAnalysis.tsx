import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { CheckCircle2, XCircle, Clock, Award, ArrowLeft, GraduationCap, Target, FileText } from 'lucide-react';

export const TestResultAnalysis: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<any | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const res = await testApi.getAttemptAnalysis(attemptId);
        if (res.success) {
          setAttempt(res.attempt);
          setResponses(res.responses || []);
        }
      } catch (err) {
        console.error('Error fetching test analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [attemptId]);

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} /> },
    { label: 'Test History', path: '/student/history', icon: <FileText size={18} /> },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading detailed test analysis & solutions..." />;
  }

  return (
    <PortalSidebarLayout portalTitle="Assessment Review" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate('/student/history')}>
              Back to Test History
            </Button>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
              Detailed Test Review & Solutions
            </h1>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '2px' }}>
              {attempt?.mock_test?.title || 'Mock Test'} — Evaluated Session
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge variant={attempt?.percentage >= 75 ? 'success' : 'warning'} size="md">
              Score: {attempt?.score_obtained} / {attempt?.mock_test?.max_marks || 120} ({attempt?.percentage}%)
            </Badge>
          </div>
        </div>

        {/* Responses Breakdown List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {responses.map((r, idx) => {
            const q = r.question || {};
            const isCorrect = r.is_correct;
            const selectedOpt = r.selected_options?.selected || 'None';
            const correctOpt = q.answers?.correct || q.answers?.correct_option || q.answers || 'A';

            return (
              <Card
                key={r.attempt_answer_id || idx}
                variant="glass"
                padding="lg"
                style={{
                  borderLeft: isCorrect
                    ? '4px solid #10B981'
                    : selectedOpt === 'None'
                    ? '4px solid #64748B'
                    : '4px solid #EF4444',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#9A751A' }}>
                    QUESTION {idx + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isCorrect ? (
                      <span style={{ color: '#059669', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Correct (+{q.marks_per_question || 4})
                      </span>
                    ) : selectedOpt === 'None' ? (
                      <span style={{ color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
                        Unanswered (0)
                      </span>
                    ) : (
                      <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={16} /> Incorrect (-{q.negative_marking || 1})
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '16px', color: '#0F172A', lineHeight: 1.6, marginBottom: '18px', fontWeight: 500 }}>
                  {q.question_text}
                </p>

                {/* Options Review */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {q.option_array?.map((opt: any) => {
                    const isSelected = selectedOpt === opt.key;
                    const isTheCorrectOne = String(correctOpt).toLowerCase() === opt.key.toLowerCase();

                    let border = '1px solid #E2E8F0';
                    let bg = '#F8FAFC';
                    let textColor = '#334155';

                    if (isTheCorrectOne) {
                      border = '1px solid #A7F3D0';
                      bg = '#ECFDF5';
                      textColor = '#059669';
                    } else if (isSelected && !isCorrect) {
                      border = '1px solid #FECACA';
                      bg = '#FEF2F2';
                      textColor = '#DC2626';
                    }

                    return (
                      <div
                        key={opt.key}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border,
                          background: bg,
                          color: textColor,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{opt.key}.</span>
                        <span>{opt.text}</span>
                        {isTheCorrectOne && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700 }}>(Correct Answer)</span>}
                        {isSelected && !isTheCorrectOne && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700 }}>(Your Choice)</span>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PortalSidebarLayout>
  );
};
