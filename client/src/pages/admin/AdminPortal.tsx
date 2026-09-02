import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi } from '../../api/admin.api.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  Shield,
  Lock,
  Mail,
  School,
  CheckCircle,
  XCircle,
  PlusCircle,
  BarChart3,
  Users,
  Award,
  LogOut,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, adminLogin, logout } = useAuth();

  // Authentication State (when not logged in as Admin)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Dashboard State (when authenticated)
  const [activeTab, setActiveTab] = useState<'metrics' | 'verification' | 'mock-tests' | 'schools'>('verification');
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingSchools, setPendingSchools] = useState<any[]>([]);
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Mock Test Creation Form State
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [maxMarks, setMaxMarks] = useState(120);
  const [durationMins, setDurationMins] = useState(60);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [testCreating, setTestCreating] = useState(false);

  const isPlatformAdmin = user && user.role === 'ADMIN';

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const [mRes, pRes, aRes] = await Promise.all([
        adminApi.getPlatformMetrics().catch(() => ({ metrics: null })),
        adminApi.getPendingSchools().catch(() => ({ schools: [] })),
        adminApi.getAllSchools().catch(() => ({ schools: [] })),
      ]);
      setMetrics(mRes.metrics);
      setPendingSchools(pRes.schools || []);
      setAllSchools(aRes.schools || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isPlatformAdmin) {
      loadDashboardData();
    }
  }, [isPlatformAdmin]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setAuthError(null);
      await adminLogin(email, password);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid administrator credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleApproveSchool = async (schoolId: string) => {
    try {
      const res = await adminApi.approveSchool(schoolId);
      setActionMessage(res.message || 'School approved successfully.');
      await loadDashboardData();
    } catch (err: any) {
      setActionMessage('Failed to approve school: ' + err.message);
    }
  };

  const handleRejectSchool = async (schoolId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      const res = await adminApi.rejectSchool(schoolId, reason || undefined);
      setActionMessage(res.message || 'School registration rejected.');
      await loadDashboardData();
    } catch (err: any) {
      setActionMessage('Failed to reject school: ' + err.message);
    }
  };

  const handleCreateMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTestCreating(true);
      const res = await adminApi.createMockTest({
        title: testTitle,
        description: testDesc,
        total_questions: totalQuestions,
        max_marks: maxMarks,
        max_time_in_mins: durationMins,
        negative_marking: negativeMarking,
      });
      setActionMessage(res.message || 'Mock test created successfully.');
      setTestTitle('');
      setTestDesc('');
      await loadDashboardData();
    } catch (err: any) {
      setActionMessage('Failed to create mock test: ' + err.message);
    } finally {
      setTestCreating(false);
    }
  };

  // IF NOT AUTHENTICATED AS ADMIN: SHOW DEDICATED ADMIN LOGIN FORM
  if (!isPlatformAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.08) 0%, #F8FAFC 70%)',
        }}
      >
        <Card
          variant="glass"
          padding="lg"
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 4px 16px rgba(244, 63, 94, 0.3)',
              }}
            >
              <Shield size={28} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
              Platform Administration
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
              Restricted system management for Jaypee University authorities
            </p>
          </div>

          {authError && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Admin Email Address"
              type="email"
              placeholder="admin@jaypee.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Admin Security Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <Button
              type="submit"
              variant="danger"
              size="lg"
              loading={authLoading}
              icon={<Shield size={18} />}
              style={{
                width: '100%',
                marginTop: '10px',
                background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.25)',
              }}
            >
              Authenticate as Platform Admin
            </Button>
          </form>

          <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', marginTop: '24px' }}>
            Access is monitored and logged under Jaypee Information Security Standards.
          </p>
        </Card>
      </div>
    );
  }

  // AUTHENTICATED: SHOW FULL PLATFORM ADMIN DASHBOARD
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Admin Navigation Header */}
      <header
        style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>JAYPEE PLATFORM ADMIN</div>
            <div style={{ fontSize: '11px', color: '#E11D48', fontWeight: 700 }}>MASTER OPERATIONS</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={15} />} onClick={loadDashboardData}>
            Refresh
          </Button>
          <Button variant="danger" size="sm" icon={<LogOut size={15} />} onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Admin Tab Selector */}
      <div style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { id: 'verification', label: `School Verification Queue (${pendingSchools.length})`, icon: <Clock size={16} /> },
            { id: 'metrics', label: 'Platform Metrics', icon: <BarChart3 size={16} /> },
            { id: 'mock-tests', label: 'Mock Test Manager', icon: <Layers size={16} /> },
            { id: 'schools', label: `All Schools (${allSchools.length})`, icon: <School size={16} /> },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setActionMessage(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 4px',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#E11D48' : '#475569',
                  borderBottom: active ? '2px solid #E11D48' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content View */}
      <main style={{ padding: '32px' }}>
        {actionMessage && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '8px',
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              color: '#0369A1',
              fontSize: '14px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} style={{ background: 'transparent', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Dismiss
            </button>
          </div>
        )}

        {dataLoading ? (
          <LoadingSpinner message="Querying platform records..." />
        ) : (
          <>
            {/* TAB 1: SCHOOL VERIFICATION QUEUE */}
            {activeTab === 'verification' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
                    School Verification Queue
                  </h2>
                  <p style={{ color: '#475569', fontSize: '14px' }}>
                    Newly registered institutions requiring official authentication before activating faculty & student onboarding.
                  </p>
                </div>

                {pendingSchools.length === 0 ? (
                  <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
                    <CheckCircle size={40} style={{ color: '#059669', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>Verification Queue Clear</h3>
                    <p style={{ color: '#475569', fontSize: '14px' }}>All submitted schools have been verified or resolved.</p>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingSchools.map((s) => {
                      const p = Array.isArray(s.principal) ? s.principal[0] : s.principal;
                      return (
                        <Card key={s.school_id} variant="glass" padding="md" style={{ borderLeft: '4px solid #F59E0B' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{s.name}</h3>
                                <Badge variant="warning">STATUS: PENDING</Badge>
                                <Badge variant="default">{s.board_affiliation || 'CBSE'}</Badge>
                              </div>
                              <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>
                                Location: <strong>{s.city}, {s.state}</strong> | PIN: {s.pin || 'N/A'} | Reg No: {s.registration_no || 'N/A'}
                              </div>
                              <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                                Principal Contact: <strong>{p?.full_name || 'Principal'}</strong> ({p?.email || s.contact_email}) | Phone: {p?.phone || s.official_phone || 'N/A'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <Button
                                variant="gold"
                                size="sm"
                                icon={<CheckCircle size={15} />}
                                onClick={() => handleApproveSchool(s.school_id)}
                              >
                                Approve School
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<XCircle size={15} />}
                                onClick={() => handleRejectSchool(s.school_id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PLATFORM METRICS */}
            {activeTab === 'metrics' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Platform Health & Scale</h2>
                  <p style={{ color: '#475569', fontSize: '14px' }}>Live counts calculated from active Supabase database records.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <Card variant="glass" padding="md">
                    <div style={{ fontSize: '13px', color: '#64748B' }}>Total Registered Schools</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{metrics?.totalSchools || 0}</div>
                    <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>{metrics?.verifiedSchools || 0} Verified</div>
                  </Card>
                  <Card variant="glass" padding="md">
                    <div style={{ fontSize: '13px', color: '#64748B' }}>Pending Verifications</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{metrics?.pendingSchools || 0}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Awaiting review</div>
                  </Card>
                  <Card variant="glass" padding="md">
                    <div style={{ fontSize: '13px', color: '#64748B' }}>Class 12 Students</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#0284C7', marginTop: '4px' }}>{metrics?.class12Students || 0}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Active enrolled cohort</div>
                  </Card>
                  <Card variant="glass" padding="md">
                    <div style={{ fontSize: '13px', color: '#64748B' }}>Active Faculty Members</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#9A751A', marginTop: '4px' }}>{metrics?.activeTeachers || 0}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Teaching staff</div>
                  </Card>
                  <Card variant="glass" padding="md">
                    <div style={{ fontSize: '13px', color: '#64748B' }}>Class 12 Mock Tests</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>{metrics?.totalMockTests || 0}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Standardized tests</div>
                  </Card>
                  <Card variant="glass" padding="md">
                    <div style={{ fontSize: '13px', color: '#64748B' }}>Completed Attempts</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{metrics?.totalAttempts || 0}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Evaluated sessions</div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 3: MOCK TEST MANAGER */}
            {activeTab === 'mock-tests' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Class 12 Mock Test Authoring</h2>
                  <p style={{ color: '#475569', fontSize: '14px' }}>Publish standardized mock assessments for Class 12 high school students.</p>
                </div>

                <Card variant="glass" padding="lg" style={{ maxWidth: '680px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Create New Assessment</h3>
                  <form onSubmit={handleCreateMockTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                      label="Test Title"
                      placeholder="CBSE Class 12 — Physics Full Syllabus Mock 01"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      required
                    />
                    <Input
                      label="Instructions / Syllabus Summary"
                      placeholder="Covers Electrostatics, Optics, and Modern Physics. +4 for correct, -1 for incorrect."
                      value={testDesc}
                      onChange={(e) => setTestDesc(e.target.value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      <Input
                        label="Total Questions"
                        type="number"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(Number(e.target.value))}
                        required
                      />
                      <Input
                        label="Maximum Marks"
                        type="number"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(Number(e.target.value))}
                        required
                      />
                      <Input
                        label="Duration (Minutes)"
                        type="number"
                        value={durationMins}
                        onChange={(e) => setDurationMins(Number(e.target.value))}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="gold"
                      loading={testCreating}
                      icon={<PlusCircle size={16} />}
                      style={{ marginTop: '8px' }}
                    >
                      Publish Mock Test
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {/* TAB 4: ALL SCHOOLS DIRECTORY */}
            {activeTab === 'schools' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>All Registered Schools</h2>
                  <p style={{ color: '#475569', fontSize: '14px' }}>Comprehensive directory of institutions on the platform.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {allSchools.map((s) => (
                    <Card key={s.school_id} variant="glass" padding="md">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{s.name}</h4>
                            <Badge variant={s.status === 'VERIFIED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'danger'}>
                              {s.status}
                            </Badge>
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                            {s.city}, {s.state} | {s.board_affiliation || 'CBSE'} | Type: {s.school_type || 'Private'}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Registered: {new Date(s.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
