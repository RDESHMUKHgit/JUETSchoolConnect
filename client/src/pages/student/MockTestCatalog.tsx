import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  Target,
  Clock,
  GraduationCap,
  FileText,
  KeyRound,
  ShieldAlert,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';

export const MockTestCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pre-Exam Access Key & Rules Modal state
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [accessKeyInput, setAccessKeyInput] = useState<string>('');
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
  const [verifyingKey, setVerifyingKey] = useState<boolean>(false);
  const [keyError, setKeyError] = useState<string | null>(null);

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

  const handleOpenPreExamModal = (test: any) => {
    setSelectedTest(test);
    setAccessKeyInput('');
    setRulesAccepted(false);
    setKeyError(null);
  };

  const handleVerifyAndStart = async () => {
    if (!selectedTest) return;
    const cleanKey = accessKeyInput.trim();

    if (!rulesAccepted) {
      setKeyError('Please accept the examination rules and anti-cheat guidelines to proceed.');
      return;
    }

    if (cleanKey.length !== 6) {
      setKeyError('Please enter the complete 6-digit numeric access key.');
      return;
    }

    try {
      setVerifyingKey(true);
      setKeyError(null);
      const res = await testApi.validateAccessKey(selectedTest.mock_test_id, cleanKey);
      if (res.success) {
        // Navigate to dedicated Test Runner Engine with access key verified
        sessionStorage.setItem(`exam_auth_key_${selectedTest.mock_test_id}`, cleanKey);
        navigate(`/student/attempt/${selectedTest.mock_test_id}`);
      } else {
        setKeyError(res.message || 'Invalid or expired 6-digit access key.');
      }
    } catch (err: any) {
      setKeyError(err.message || 'Verification failed. Please check your key or contact your teacher.');
    } finally {
      setVerifyingKey(false);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} /> },
    { label: 'Test History', path: '/student/history', icon: <FileText size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle="Class 12 Mock Assessments" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Standardized Mock Tests
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Calibrated simulations for CBSE Class 12 board preparations and engineering entrance examinations.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading available test schedules..." />
        ) : mockTests.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <Target size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Active Tests Scheduled</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Jaypee Platform Administration is currently scheduling the next batch of All-India Class 12 mock assessments.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {mockTests.map((t) => (
              <Card
                key={t.mock_test_id}
                variant="glass"
                padding="lg"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '3px solid #C59B27',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <Badge variant="info">{t.subject?.name || 'Science'}</Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569' }}>
                      <Clock size={15} style={{ color: '#9A751A' }} />
                      <span>{t.max_time_in_mins} Mins</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {t.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                    {t.description || 'Standardized test simulation strictly conforming to Class 12 board and entrance blueprints.'}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Questions: <strong style={{ color: '#0F172A' }}>{t.total_questions}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Total Marks: <strong style={{ color: '#0F172A' }}>{t.max_marks}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Passing: <strong style={{ color: '#059669' }}>{t.passing_marks || '40%'}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Negative: <strong style={{ color: t.negative_marking ? '#DC2626' : '#059669' }}>{t.negative_marking ? 'Yes (-1)' : 'None'}</strong>
                    </div>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="md"
                  icon={<Target size={16} />}
                  onClick={() => handleOpenPreExamModal(t)}
                  style={{ width: '100%' }}
                >
                  Start Test Attempt
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Pre-Exam Instructions & Access Key Modal */}
        <Modal
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          title="Examination Candidate Clearance"
          maxWidth="560px"
        >
          {selectedTest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {selectedTest.title}
                </h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#64748B' }}>
                  <span>Duration: <strong style={{ color: '#0F172A' }}>{selectedTest.max_time_in_mins} Mins</strong></span>
                  <span>•</span>
                  <span>Questions: <strong style={{ color: '#0F172A' }}>{selectedTest.total_questions}</strong></span>
                  <span>•</span>
                  <span>Marking: <strong style={{ color: '#0F172A' }}>+4 / -1</strong></span>
                </div>
              </div>

              {/* Anti-Cheat & Rules Notice */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 700, fontSize: '13px' }}>
                  <ShieldAlert size={17} />
                  <span>Standardized Examination Protocol</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350F', fontSize: '12px', lineHeight: 1.6 }}>
                  <li>Full-screen mode is required throughout the test duration.</li>
                  <li>Tab switching, window resizing, or developer shortcuts are recorded as violations.</li>
                  <li>The test timer will run continuously. Upon reaching <strong>00:00:00</strong>, your exam will <strong>automatically submit</strong>.</li>
                  <li>Ensure an uninterrupted internet connection before launching.</li>
                </ul>
              </div>

              {/* 6-Digit Access Key Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Teacher Issued 6-Digit Access Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={accessKeyInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setAccessKeyInput(val);
                      setKeyError(null);
                    }}
                    placeholder="Enter 6-digit key (e.g. 948123)"
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '8px',
                      border: keyError ? '1px solid #DC2626' : '1px solid #CBD5E1',
                      padding: '0 16px 0 44px',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '0.25em',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <KeyRound
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Ask your invigilating teacher for the 60-minute session access key.
                </span>
              </div>

              {/* Terms Checkbox */}
              <div
                onClick={() => setRulesAccepted(!rulesAccepted)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  background: rulesAccepted ? '#F0FDF4' : 'transparent',
                }}
              >
                {rulesAccepted ? (
                  <CheckSquare size={18} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Square size={18} style={{ color: '#94A3B8', flexShrink: 0, marginTop: '2px' }} />
                )}
                <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  I have read and understood all candidate instructions. I confirm that I will not use unauthorized materials or switch tabs during this assessment.
                </span>
              </div>

              {keyError && (
                <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                  {keyError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={() => setSelectedTest(null)} disabled={verifyingKey}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  icon={<ArrowRight size={16} />}
                  loading={verifyingKey}
                  disabled={!rulesAccepted || accessKeyInput.trim().length !== 6}
                  onClick={handleVerifyAndStart}
                >
                  Verify Key & Start Exam
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
