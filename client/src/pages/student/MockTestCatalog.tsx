import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { getStudentNavItems } from '../../utils/navigation.js';
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
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';

export const MockTestCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

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

  // Filtered mock tests
  const filteredTests = useMemo(() => {
    return mockTests.filter((t) => {
      const expiresAt = t.access_key_expires_at || t.key_expires_at;
      const isKeyActive = Boolean(t.access_key && expiresAt && new Date(expiresAt) > new Date());
      const isCompleted = Boolean(t.has_attempted);

      if (filterTab === 'ACTIVE' && (!isKeyActive || isCompleted)) return false;
      if (filterTab === 'COMPLETED' && !isCompleted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [mockTests, filterTab, searchQuery]);

  const navItems = getStudentNavItems(mockTests.length);

  return (
    <PortalSidebarLayout portalTitle="Class 12 Mock Assessments" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Standardized Mock Tests
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Calibrated simulations for CBSE Class 12 board preparations and engineering entrance examinations.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <Card variant="glass" padding="md">
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search mock assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: filterTab === tab ? '#0F172A' : '#F1F5F9',
                    color: filterTab === tab ? '#FFFFFF' : '#475569',
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab === 'ALL' ? 'All Mock Tests' : tab === 'ACTIVE' ? 'Active Window' : 'Completed'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {loading ? (
          <LoadingSpinner message="Loading available test schedules..." />
        ) : filteredTests.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <Target size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Tests Found</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              No mock tests match your filter criteria or search query.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredTests.map((t) => {
              const expiresAt = t.access_key_expires_at || t.key_expires_at;
              const isCompleted = Boolean(t.has_attempted);
              const isKeyActive = Boolean(t.access_key && expiresAt && new Date(expiresAt) > new Date());
              const isKeyExpired = Boolean(t.access_key && expiresAt && new Date(expiresAt) <= new Date());

              return (
                <Card
                  key={t.mock_test_id}
                  variant="glass"
                  padding="lg"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: isCompleted ? '3px solid #10B981' : isKeyActive ? '3px solid #C59B27' : '3px solid #CBD5E1',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <Badge variant="info">{t.subject?.name || 'Science'}</Badge>
                      
                      {/* 4 Card Status Badges */}
                      {isCompleted ? (
                        <Badge variant="success">Completed</Badge>
                      ) : isKeyActive ? (
                        <Badge variant="gold">Active Window</Badge>
                      ) : isKeyExpired ? (
                        <Badge variant="danger">Access Expired</Badge>
                      ) : (
                        <Badge variant="default">Awaiting Key</Badge>
                      )}
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
                        Duration: <strong style={{ color: '#0F172A' }}>{t.max_time_in_mins} Mins</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        Total Marks: <strong style={{ color: '#0F172A' }}>{t.max_marks}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        Marking: <strong style={{ color: '#0F172A' }}>+4 / -1</strong>
                      </div>
                    </div>
                  </div>

                  {/* 4 Card Action Button States */}
                  {isCompleted ? (
                    <Button
                      variant="secondary"
                      size="md"
                      disabled
                      icon={<CheckCircle2 size={16} style={{ color: '#10B981' }} />}
                      style={{ width: '100%', opacity: 0.75, cursor: 'not-allowed' }}
                    >
                      Attempt Completed (Single Attempt Enforced)
                    </Button>
                  ) : isKeyActive ? (
                    <Button
                      variant="gold"
                      size="md"
                      icon={<Target size={16} />}
                      onClick={() => handleOpenPreExamModal(t)}
                      style={{ width: '100%' }}
                    >
                      Start Test Attempt
                    </Button>
                  ) : isKeyExpired ? (
                    <Button
                      variant="secondary"
                      size="md"
                      disabled
                      icon={<Lock size={15} style={{ color: '#EF4444' }} />}
                      style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
                    >
                      Access Window Expired
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      disabled
                      icon={<KeyRound size={15} style={{ color: '#94A3B8' }} />}
                      style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
                    >
                      Awaiting Access Key from Teacher
                    </Button>
                  )}
                </Card>
              );
            })}
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
                  <li>Strict <strong>single-attempt</strong> policy enforced. Retakes are prohibited.</li>
                  <li>Questions proceed in <strong>forward-only progression</strong> (previous questions cannot be revisited).</li>
                  <li>Full-screen mode is required throughout the test duration.</li>
                  <li>Tab switching, window resizing, or shortcuts trigger security alerts.</li>
                  <li>The test timer runs continuously. Upon reaching <strong>00:00:00</strong>, the exam submits automatically.</li>
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
                    placeholder="e.g. 849201"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      fontSize: '18px',
                      fontFamily: 'monospace',
                      letterSpacing: '4px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: keyError ? '1px solid #EF4444' : '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <KeyRound size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
                {keyError && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                    {keyError}
                  </p>
                )}
              </div>

              {/* Anti-cheat Agreement Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#0F172A', cursor: 'pointer' }}
                />
                <span>
                  I confirm that I will not switch tabs, use external aids, or violate examination integrity protocols during this assessment.
                </span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button variant="secondary" onClick={() => setSelectedTest(null)}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  icon={<ArrowRight size={16} />}
                  loading={verifyingKey}
                  disabled={!rulesAccepted || accessKeyInput.trim().length !== 6}
                  onClick={handleVerifyAndStart}
                >
                  Verify Key & Commence
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
