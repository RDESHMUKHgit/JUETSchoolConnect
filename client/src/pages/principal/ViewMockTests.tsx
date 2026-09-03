import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
  Eye,
  GraduationCap,
  UploadCloud,
  UserCheck,
  Target,
} from 'lucide-react';

export const ViewMockTests: React.FC<{ role?: 'PRINCIPAL' | 'TEACHER' }> = ({ role = 'PRINCIPAL' }) => {
  const { user } = useAuth();
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspection modal state
  const [inspectedTest, setInspectedTest] = useState<any | null>(null);
  const [inspectedQuestions, setInspectedQuestions] = useState<any[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const res = await testApi.getMockTests();
        if (res.success) {
          setMockTests(res.mockTests || []);
        }
      } catch (err) {
        console.error('Error fetching mock tests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const handleInspectPaper = async (testId: string) => {
    try {
      setInspectLoading(true);
      setInspectedTest(null);
      setInspectedQuestions([]);
      const res = await testApi.getFullTestPaper(testId);
      if (res.success) {
        setInspectedTest(res.mockTest);
        setInspectedQuestions(res.questions || []);
      }
    } catch (err: any) {
      alert('Failed to inspect test paper: ' + err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  const navItems =
    role === 'PRINCIPAL'
      ? [
          { label: 'Overview', path: '/principal', icon: <BookOpen size={18} /> },
          { label: 'Manage Teachers', path: '/principal/teachers', icon: <BookOpen size={18} /> },
          { label: 'Class 12 Students', path: '/principal/students', icon: <GraduationCap size={18} /> },
          { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <Target size={18} /> },
        ]
      : [
          { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
          { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} /> },
          { label: 'Upload CSV (Students)', path: '/teacher/students/upload', icon: <UploadCloud size={18} /> },
          { label: 'Pending Verifications', path: '/teacher/students/verification', icon: <UserCheck size={18} /> },
          { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
        ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Academic Portal'} portalRole={role} navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Standardized Mock Tests
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Inspect questions, marking schemes, and answer keys published by the Jaypee Examination Authority.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching mock test blueprints..." />
        ) : mockTests.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <Layers size={36} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Active Mock Tests</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Platform Administration has not published any active tests for this cycle.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {mockTests.map((t) => (
              <Card
                key={t.mock_test_id}
                variant="glass"
                padding="lg"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Badge variant="gold">{t.subject?.name || 'Science'}</Badge>
                    <Badge variant="default">Class 12</Badge>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {t.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                    {t.description || 'Standardized test simulation aligned with JEE Main blueprint.'}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Questions: <strong style={{ color: '#0F172A' }}>{t.total_questions || 5}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Max Marks: <strong style={{ color: '#0F172A' }}>{t.max_marks || 20}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Duration: <strong style={{ color: '#0F172A' }}>{t.max_time_in_mins} mins</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Marking: <strong style={{ color: '#0F172A' }}>+4 / -1</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ width: '100%' }}
                    icon={<Eye size={15} />}
                    onClick={() => handleInspectPaper(t.mock_test_id)}
                  >
                    Inspect Questions & Answer Keys
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Paper Inspection Modal */}
        <Modal
          isOpen={!!inspectedTest}
          onClose={() => setInspectedTest(null)}
          title={inspectedTest?.title || 'Mock Test Blueprint & Solution Keys'}
          maxWidth="720px"
        >
          {inspectLoading ? (
            <LoadingSpinner message="Retrieving question paper and answer keys..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  padding: '12px 16px',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Total Questions</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {inspectedQuestions.length} Questions
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Time Limit</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {inspectedTest?.max_time_in_mins} Mins
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Maximum Marks</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {inspectedTest?.max_marks} Marks
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inspectedQuestions.map((q, idx) => {
                  const correctKey = q.answers?.correct || q.answers?.key || q.answers;
                  return (
                    <div
                      key={q.question_id || idx}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#9A751A' }}>
                          QUESTION {idx + 1}
                        </span>
                        <Badge variant="gold" size="sm">
                          Verified Key: Option {String(correctKey).toUpperCase()}
                        </Badge>
                      </div>

                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#0F172A',
                          lineHeight: 1.5,
                          marginBottom: '14px',
                        }}
                      >
                        {q.question_text}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                        {(q.option_array || []).map((opt: any, optIdx: number) => {
                          const isCorrect = String(opt.key).toUpperCase() === String(correctKey).toUpperCase();
                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: isCorrect ? '1px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isCorrect ? '#ECFDF5' : '#F8FAFC',
                                color: isCorrect ? '#065F46' : '#334155',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ fontWeight: 800 }}>{opt.key}.</span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#059669' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
