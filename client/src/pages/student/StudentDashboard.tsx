import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  GraduationCap,
  Target,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        setLoading(true);
        const [hRes, tRes] = await Promise.all([
          testApi.getHistory().catch(() => ({ attempts: [] })),
          testApi.getMockTests().catch(() => ({ mockTests: [] })),
        ]);
        setHistory(hRes.attempts || []);
        setMockTests(tRes.mockTests || []);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  const totalAttempts = history.length;
  const avgPercentage =
    totalAttempts > 0
      ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalAttempts)
      : 0;

  const bestAttempt = history.reduce(
    (max, curr) => (curr.percentage > (max?.percentage || 0) ? curr : max),
    null
  );

  const qualifiesForScholarship = bestAttempt && bestAttempt.percentage >= 80;

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} />, badge: `${mockTests.length} ready` },
    { label: 'Test History', path: '/student/history', icon: <FileText size={18} />, badge: `${totalAttempts}` },
  ];

  return (
    <PortalSidebarLayout portalTitle="Class 12 Academic Cockpit" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
                Welcome, {user?.fullName || 'Student'}
              </h1>
              <Badge variant="success">Class 12</Badge>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              Enrolled at: <strong style={{ color: '#0F172A' }}>{user?.schoolName || 'Your School'}</strong> | Status: Verified
            </p>
          </div>

          <Button
            variant="gold"
            icon={<Target size={16} />}
            onClick={() => navigate('/student/mock-tests')}
          >
            Launch Mock Test
          </Button>
        </div>

        {/* Jaypee Scholarship Alert Banner (if qualified) */}
        {qualifiesForScholarship && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FEFCE8 0%, #FFFFFF 100%)',
              border: '1px solid #FEF08A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Award size={32} style={{ color: '#9A751A' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Congratulations! You Qualify for Jaypee Merit Scholarship Credits
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                  Your top score of <strong>{bestAttempt.percentage}%</strong> qualifies you for tuition fee waivers at Jaypee University.
                </p>
              </div>
            </div>
            <Badge variant="gold">Tuition Waiver Eligible</Badge>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Retrieving your performance snapshot..." />
        ) : (
          <>
            {/* Snapshot Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Tests Completed</span>
                  <FileText size={20} style={{ color: '#0284C7' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {totalAttempts}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  All-India mock sessions
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Average Score</span>
                  <TrendingUp size={20} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: avgPercentage >= 70 ? '#059669' : '#D97706', marginTop: '8px' }}>
                  {avgPercentage}%
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Across all attempts
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Best Score</span>
                  <Award size={20} style={{ color: '#9A751A' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#9A751A', marginTop: '8px' }}>
                  {bestAttempt ? `${bestAttempt.percentage}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Highest percentile achieved
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Tests Available</span>
                  <Target size={20} style={{ color: '#7C3AED' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {mockTests.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Ready to attempt today
                </div>
              </Card>
            </div>

            {/* Section: Active Tests to Attempt */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  Recommended Mock Tests
                </h2>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/student/mock-tests')}>
                  View All ({mockTests.length})
                </Button>
              </div>

              {mockTests.length === 0 ? (
                <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
                  <p style={{ color: '#475569' }}>No active tests scheduled right now. Check back soon!</p>
                </Card>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {mockTests.slice(0, 2).map((test) => (
                    <Card key={test.mock_test_id} variant="gold" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <Badge variant="info">{test.subject?.name || 'Science'}</Badge>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{test.max_time_in_mins} mins</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                          {test.title}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                          {test.total_questions} Questions | Max Marks: {test.max_marks} | Negative: {test.negative_marking ? 'Yes' : 'None'}
                        </p>
                      </div>

                      <Button
                        variant="gold"
                        size="md"
                        icon={<Target size={16} />}
                        onClick={() => navigate(`/student/attempt/${test.mock_test_id}`)}
                      >
                        Start Test Attempt
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Recent Attempt History */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  Recent Attempts
                </h2>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/student/history')}>
                  Full History
                </Button>
              </div>

              {history.length === 0 ? (
                <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
                  <p style={{ color: '#475569' }}>You haven't attempted any tests yet. Click "Launch Mock Test" above to start your first session!</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.slice(0, 3).map((att) => (
                    <Card key={att.attempt_id} variant="glass" padding="md">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                            {att.mock_test?.title || 'Mock Test Attempt'}
                          </h4>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Attempted on {new Date(att.submitted_at).toLocaleDateString()} | Correct: {att.correct_ans} | Wrong: {att.wrong_ans}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: att.percentage >= 75 ? '#059669' : '#D97706' }}>
                              {att.percentage}%
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Score: {att.score_obtained}
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/student/analysis/${att.attempt_id}`)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
