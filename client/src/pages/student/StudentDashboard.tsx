import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { getStudentNavItems } from '../../utils/navigation.js';
import {
  GraduationCap,
  Target,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  FileText,
  Edit,
  Mail,
  Phone,
  Trophy,
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
          testApi.getHistory({ limit: 20 }).catch(() => ({ attempts: [] })),
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

  // Filter active unattempted tests with valid access keys
  const activeReadyTests = useMemo(() => {
    return mockTests.filter((t) => {
      if (t.has_attempted) return false;
      const expiresAt = t.access_key_expires_at || t.key_expires_at;
      return Boolean(t.access_key && expiresAt && new Date(expiresAt) > new Date());
    });
  }, [mockTests]);

  // Limit recent attempts to latest 5 sorted newest to oldest
  const recentAttempts = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(b.submitted_at || b.created_at || 0).getTime() - new Date(a.submitted_at || a.created_at || 0).getTime())
      .slice(0, 5);
  }, [history]);

  const navItems = getStudentNavItems(activeReadyTests.length, totalAttempts);

  return (
    <PortalSidebarLayout portalTitle="Class 12 Academic Cockpit" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

        {/* Student Profile Card (Before statistics) */}
        <Card variant="glass" padding="md" style={{ borderLeft: '4px solid #10B981', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={user?.fullName || 'Student'}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ECFDF5', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 800, fontSize: '22px' }}>
                  {(user?.fullName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {user?.fullName || 'Candidate'}
                  </h2>
                  <Badge variant="success">Class 12 Candidate</Badge>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#475569' }}>
                  {user?.schoolName || 'School'}
                  {user?.admission_no ? ` • Admission: ${user.admission_no}` : ''}
                  {user?.apaar ? ` • APAAR: ${user.apaar}` : ''}
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} /> {user?.email}
                  </span>
                  {(user?.phone_no || user?.phone) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} /> {user.phone_no || user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit size={14} />}
              onClick={() => navigate('/student/profile-setup')}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

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
                  Congratulations! You Qualify for Platform Merit Scholarship Credits
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                  Your top score of <strong>{bestAttempt.percentage}%</strong> qualifies you for institutional tuition fee waivers and academic counseling.
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
              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/student/history')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Tests Completed</span>
                  <FileText size={20} style={{ color: '#0284C7' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {totalAttempts}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  All-India mock sessions &rarr;
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/student/history')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Average Score</span>
                  <TrendingUp size={20} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: avgPercentage >= 70 ? '#059669' : '#D97706', marginTop: '8px' }}>
                  {avgPercentage}%
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Across all attempts &rarr;
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/student/history')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Best Score</span>
                  <Award size={20} style={{ color: '#9A751A' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#9A751A', marginTop: '8px' }}>
                  {bestAttempt ? `${bestAttempt.percentage}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Highest percentile achieved &rarr;
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/student/mock-tests')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Active Tests Ready</span>
                  <Target size={20} style={{ color: '#7C3AED' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {activeReadyTests.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  With valid access keys &rarr;
                </div>
              </Card>
            </div>

            {/* Section: Active Tests to Attempt (Filtered to valid unexpired keys and unattempted) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  Active Mock Tests Ready for Attempt
                </h2>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/student/mock-tests')}>
                  View All Mock Tests ({mockTests.length})
                </Button>
              </div>

              {activeReadyTests.length === 0 ? (
                <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
                  <Target size={36} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    No Tests with Active Access Keys
                  </h3>
                  <p style={{ color: '#475569', fontSize: '13px', maxWidth: '440px', margin: '0 auto 14px' }}>
                    Mock tests require an active 6-digit access key issued by your teacher. When your faculty activates a test session, it will appear here.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/student/mock-tests')}>
                    Inspect Full Mock Test Catalog
                  </Button>
                </Card>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {activeReadyTests.slice(0, 2).map((test) => (
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
                          {test.total_questions} Questions | Max Marks: {test.max_marks} | Marking: +4 / -1
                        </p>
                      </div>

                      <Button
                        variant="gold"
                        size="md"
                        icon={<Target size={16} />}
                        onClick={() => navigate('/student/mock-tests')}
                      >
                        Enter Access Key & Attempt
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Recent Attempt History (Latest 5 sorted newest to oldest) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  Recent Attempts (Latest 5)
                </h2>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/student/history')}>
                  Full History ({history.length})
                </Button>
              </div>

              {recentAttempts.length === 0 ? (
                <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
                  <p style={{ color: '#475569' }}>You haven't attempted any tests yet. Click "Launch Mock Test" above to start your first session!</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentAttempts.map((att) => (
                    <Card key={att.attempt_id} variant="glass" padding="md">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                            {att.mock_test?.title || 'Mock Test Attempt'}
                          </h4>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Attempted on {new Date(att.submitted_at || att.created_at).toLocaleDateString()} | Correct: {att.correct_ans} | Wrong: {att.wrong_ans} | Time Taken: {Math.round((att.time_taken || 0) / 60)} mins
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
                            View Result
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
