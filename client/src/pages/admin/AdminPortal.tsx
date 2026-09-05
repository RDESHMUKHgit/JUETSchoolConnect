import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi } from '../../api/admin.api.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout, NavItem } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { StatusPieChart } from '../../components/admin/StatusPieChart.js';
import {
  Shield,
  Lock,
  Mail,
  School,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  Award,
  RefreshCw,
  Clock,
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Building2,
  FileText,
  UserCheck,
  AlertCircle,
  Layers,
  Sparkles,
  Phone,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, adminLogin, logout } = useAuth();
  const navigate = useNavigate();

  // Authentication State (when not logged in as Admin)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'hierarchy' | 'matrix' | 'mock-tests' | 'verification'>('overview');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Platform Metrics & Overview Data
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingSchools, setPendingSchools] = useState<any[]>([]);

  // Hierarchy Explorer State
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolStatusFilter, setSchoolStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');
  const [selectedSchoolHierarchy, setSelectedSchoolHierarchy] = useState<any | null>(null);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [hierarchySubView, setHierarchySubView] = useState<'teachers' | 'all-students'>('teachers');
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState<any | null>(null);
  const [teacherStudentsLoading, setTeacherStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Platform Matrix & Detailed Analytics State
  const [detailedMetrics, setDetailedMetrics] = useState<any | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [activeChartFilter, setActiveChartFilter] = useState<{ category: 'principals' | 'schools' | 'teachers' | 'students'; status: string } | null>(null);
  const [matrixSearch, setMatrixSearch] = useState('');
  const [selectedMicroSchoolId, setSelectedMicroSchoolId] = useState<string>('');
  const [selectedMicroTeacherId, setSelectedMicroTeacherId] = useState<string>('');

  // Mock Tests State (View Only)
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [testSearch, setTestSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [testLoading, setTestLoading] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectingTest, setInspectingTest] = useState<any | null>(null);
  const [inspectingLoading, setInspectingLoading] = useState(false);
  const [inspectModalTab, setInspectModalTab] = useState<'analytics' | 'questions'>('analytics');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [inspectAnalyticsData, setInspectAnalyticsData] = useState<any | null>(null);

  const isPlatformAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  useEffect(() => {
    // Strictly isolate: Super Admin does not use Exam Admin view
    if (user && user.role === 'EXAM_ADMIN') {
      navigate('/admin/exam');
    }
  }, [user, navigate]);

  const loadInitialData = async () => {
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
      console.error('Error loading initial admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const loadDetailedMatrix = async () => {
    try {
      setMatrixLoading(true);
      const res = await adminApi.getDetailedPlatformMetrics();
      if (res.success) {
        setDetailedMetrics(res);
        if (res.schoolsMicroAnalytics?.length > 0 && !selectedMicroSchoolId) {
          setSelectedMicroSchoolId(res.schoolsMicroAnalytics[0].school_id);
        }
      }
    } catch (err) {
      console.error('Error loading detailed platform matrix:', err);
    } finally {
      setMatrixLoading(false);
    }
  };

  const loadMockTests = async () => {
    try {
      setTestLoading(true);
      const res = await testApi.getMockTests();
      setMockTests(res.mockTests || []);
    } catch (err) {
      console.error('Error loading mock tests:', err);
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    if (isPlatformAdmin) {
      loadInitialData();
    }
  }, [isPlatformAdmin]);

  useEffect(() => {
    if (isPlatformAdmin && activeTab === 'matrix') {
      loadDetailedMatrix();
    } else if (isPlatformAdmin && activeTab === 'mock-tests') {
      loadMockTests();
    }
  }, [activeTab, isPlatformAdmin]);

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
      await loadInitialData();
      if (detailedMetrics) loadDetailedMatrix();
    } catch (err: any) {
      setActionMessage('Failed to approve school: ' + err.message);
    }
  };

  const handleRejectSchool = async (schoolId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      const res = await adminApi.rejectSchool(schoolId, reason || undefined);
      setActionMessage(res.message || 'School registration rejected.');
      await loadInitialData();
      if (detailedMetrics) loadDetailedMatrix();
    } catch (err: any) {
      setActionMessage('Failed to reject school: ' + err.message);
    }
  };

  // Open drill-down for a school
  const handleSelectSchool = async (schoolId: string) => {
    try {
      setHierarchyLoading(true);
      setSelectedTeacherDetails(null);
      setHierarchySubView('teachers');
      const res = await adminApi.getSchoolHierarchy(schoolId);
      if (res.success) {
        setSelectedSchoolHierarchy(res);
        setActiveTab('hierarchy');
      }
    } catch (err: any) {
      setActionMessage('Failed to load school hierarchy: ' + err.message);
    } finally {
      setHierarchyLoading(false);
    }
  };

  // Open drill-down for a teacher's assigned students
  const handleSelectTeacher = async (teacherId: string) => {
    try {
      setTeacherStudentsLoading(true);
      const res = await adminApi.getTeacherStudents(teacherId);
      if (res.success) {
        setSelectedTeacherDetails(res);
      }
    } catch (err: any) {
      setActionMessage('Failed to load teacher students: ' + err.message);
    } finally {
      setTeacherStudentsLoading(false);
    }
  };

  // Inspect full mock test paper & platform-wide analytics in modal
  const handleInspectTest = async (testId: string) => {
    try {
      setInspectingLoading(true);
      setInspectModalOpen(true);
      setInspectModalTab('analytics');
      setCandidateSearch('');
      const res = await adminApi.getMockTestAnalytics(testId);
      if (res.success) {
        setInspectingTest(res.mockTest);
        setInspectAnalyticsData({
          analytics: res.analytics,
          candidates: res.candidates || [],
        });
      }
    } catch (err: any) {
      // Fallback to getFullTestPaper or getMockTestDetails
      try {
        const alt = await testApi.getFullTestPaper(testId);
        setInspectingTest(alt.mockTest || alt);
        setInspectAnalyticsData(null);
      } catch (altErr: any) {
        setActionMessage('Failed to fetch test details: ' + err.message);
        setInspectModalOpen(false);
      }
    } finally {
      setInspectingLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!inspectAnalyticsData?.candidates) return [];
    const q = candidateSearch.toLowerCase().trim();
    if (!q) return inspectAnalyticsData.candidates;
    return inspectAnalyticsData.candidates.filter(
      (c: any) =>
        c.student_name?.toLowerCase().includes(q) ||
        c.student_email?.toLowerCase().includes(q) ||
        c.admission_no?.toLowerCase().includes(q) ||
        c.apaar?.toLowerCase().includes(q) ||
        c.school_name?.toLowerCase().includes(q) ||
        c.teacher_name?.toLowerCase().includes(q)
    );
  }, [inspectAnalyticsData, candidateSearch]);

  // Filtered Schools for Hierarchy Directory
  const filteredSchools = useMemo(() => {
    return allSchools.filter((s) => {
      const matchesStatus = schoolStatusFilter === 'ALL' || (s.status || 'PENDING') === schoolStatusFilter;
      const q = schoolSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.state?.toLowerCase().includes(q) ||
        s.registration_no?.toLowerCase().includes(q) ||
        s.principal?.full_name?.toLowerCase().includes(q) ||
        s.principal?.email?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allSchools, schoolSearch, schoolStatusFilter]);

  // Filtered Students in School view
  const filteredSchoolStudents = useMemo(() => {
    if (!selectedSchoolHierarchy?.all_students) return [];
    const q = studentSearch.toLowerCase().trim();
    if (!q) return selectedSchoolHierarchy.all_students;
    return selectedSchoolHierarchy.all_students.filter(
      (st: any) =>
        st.full_name?.toLowerCase().includes(q) ||
        st.email?.toLowerCase().includes(q) ||
        st.admission_no?.toLowerCase().includes(q) ||
        st.apaar?.toLowerCase().includes(q) ||
        st.teacher_name?.toLowerCase().includes(q)
    );
  }, [selectedSchoolHierarchy, studentSearch]);

  // Filtered Mock Tests
  const filteredMockTests = useMemo(() => {
    return mockTests.filter((t) => {
      const q = testSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.subject?.name?.toLowerCase().includes(q);
      const matchesSubject =
        selectedSubjectFilter === 'ALL' ||
        (t.subject?.name && t.subject.name.toUpperCase() === selectedSubjectFilter.toUpperCase());
      return matchesSearch && matchesSubject;
    });
  }, [mockTests, testSearch, selectedSubjectFilter]);

  // Unique subjects in mock tests
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    mockTests.forEach((t) => {
      if (t.subject?.name) set.add(t.subject.name);
    });
    return Array.from(set);
  }, [mockTests]);

  // Status-filtered records for Platform Matrix interactive table
  const matrixFilteredRecords = useMemo(() => {
    if (!activeChartFilter || !detailedMetrics) return null;
    const { category, status } = activeChartFilter;
    const key = `${category}Analytics`;
    const group = (detailedMetrics[key] || []).find((g: any) => g.status === status);
    if (!group) return [];
    let list = group.records || [];
    if (matrixSearch) {
      const q = matrixSearch.toLowerCase().trim();
      list = list.filter((r: any) => {
        const name = r.full_name || r.name || '';
        const email = r.email || '';
        const school = r.school_name || r.school?.name || '';
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || school.toLowerCase().includes(q);
      });
    }
    return list;
  }, [activeChartFilter, detailedMetrics, matrixSearch]);

  // Selected School for Micro Analytics
  const selectedMicroSchool = useMemo(() => {
    if (!detailedMetrics?.schoolsMicroAnalytics) return null;
    return (
      detailedMetrics.schoolsMicroAnalytics.find((s: any) => s.school_id === selectedMicroSchoolId) ||
      detailedMetrics.schoolsMicroAnalytics[0] ||
      null
    );
  }, [detailedMetrics, selectedMicroSchoolId]);

  // Selected Teacher for Micro Analytics
  const selectedMicroTeacher = useMemo(() => {
    if (!selectedMicroSchool || !selectedMicroTeacherId) return null;
    return selectedMicroSchool.teachers.find((t: any) => t.teacher_id === selectedMicroTeacherId) || null;
  }, [selectedMicroSchool, selectedMicroTeacherId]);

  // IF NOT AUTHENTICATED: SHOW DEDICATED ADMIN LOGIN
  if (!isPlatformAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'radial-gradient(circle at 50% 30%, rgba(225, 29, 72, 0.08) 0%, #F8FAFC 70%)',
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
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 6px 20px rgba(225, 29, 72, 0.3)',
              }}
            >
              <Shield size={30} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Super Admin Gateway
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
              School Connect Institutional Governance & Platform Analytics
            </p>
          </div>

          {authError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Super Admin Email"
              type="email"
              placeholder="admin@schoolconnect.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Master Password"
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
                background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)',
              }}
            >
              Authenticate as Super Admin
            </Button>
          </form>

          <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', marginTop: '24px' }}>
            Protected under School Connect Institutional Security Standards.
          </p>
        </Card>
      </div>
    );
  }

  // Sidebar Navigation Config
  const navItems: NavItem[] = [
    {
      label: 'Overview',
      path: '#overview',
      icon: <BarChart3 size={18} />,
      isActive: activeTab === 'overview',
      onClick: () => {
        setActiveTab('overview');
        setActionMessage(null);
      },
    },
    {
      label: 'Institutions & Hierarchy',
      path: '#hierarchy',
      icon: <Building2 size={18} />,
      badge: String(allSchools.length),
      isActive: activeTab === 'hierarchy',
      onClick: () => {
        setActiveTab('hierarchy');
        setActionMessage(null);
      },
    },
    {
      label: 'Platform Matrix & Analytics',
      path: '#matrix',
      icon: <Sparkles size={18} />,
      isActive: activeTab === 'matrix',
      onClick: () => {
        setActiveTab('matrix');
        setActionMessage(null);
      },
    },
    {
      label: 'Mock Tests (View Only)',
      path: '#mock-tests',
      icon: <BookOpen size={18} />,
      badge: metrics?.totalMockTests ? String(metrics.totalMockTests) : undefined,
      isActive: activeTab === 'mock-tests',
      onClick: () => {
        setActiveTab('mock-tests');
        setActionMessage(null);
      },
    },
    {
      label: 'Verification Queue',
      path: '#verification',
      icon: <Clock size={18} />,
      badge: pendingSchools.length > 0 ? String(pendingSchools.length) : undefined,
      isActive: activeTab === 'verification',
      onClick: () => {
        setActiveTab('verification');
        setActionMessage(null);
      },
    },
  ];

  return (
    <PortalSidebarLayout portalTitle="Super Admin" portalRole="ADMIN" navItems={navItems}>
      {/* Toast / Notification Banner */}
      {actionMessage && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: '10px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(21, 128, 61, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            style={{
              background: 'transparent',
              color: '#15803D',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: EXECUTIVE OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* Executive Header Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Super Admin Executive Console
                </h1>
                <Badge variant="danger" size="sm">
                  ROOT PRIVILEGES
                </Badge>
              </div>
              <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px', margin: 0 }}>
                Comprehensive institutional governance, faculty-student hierarchy tracking, and platform status analytics.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw size={15} />}
                onClick={() => {
                  loadInitialData();
                }}
              >
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Metric KPI Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {/* Total Schools */}
            <Card
              variant="glass"
              padding="md"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: '4px solid #E11D48',
              }}
              onClick={() => setActiveTab('hierarchy')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Registered Schools</span>
                <Building2 size={20} style={{ color: '#E11D48' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                {metrics?.totalSchools ?? allSchools.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px' }}>
                <span style={{ color: '#10B981', fontWeight: 700 }}>
                  {metrics?.verifiedSchools ?? allSchools.filter((s) => s.status === 'VERIFIED').length} Verified
                </span>
                <span style={{ color: '#94A3B8' }}>•</span>
                <span style={{ color: '#64748B' }}>Click to explore hierarchy &rarr;</span>
              </div>
            </Card>

            {/* Total Teachers */}
            <Card
              variant="glass"
              padding="md"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: '4px solid #0284C7',
              }}
              onClick={() => setActiveTab('hierarchy')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Active Faculty Members</span>
                <Users size={20} style={{ color: '#0284C7' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                {metrics?.activeTeachers || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                Institutional educators onboarded &rarr;
              </div>
            </Card>

            {/* Total Students */}
            <Card
              variant="glass"
              padding="md"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: '4px solid #10B981',
              }}
              onClick={() => setActiveTab('hierarchy')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Class 12 Students</span>
                <GraduationCap size={20} style={{ color: '#10B981' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                {metrics?.class12Students || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                Enrolled assessment candidates &rarr;
              </div>
            </Card>

            {/* Total Mock Tests */}
            <Card
              variant="glass"
              padding="md"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: '4px solid #8B5CF6',
              }}
              onClick={() => setActiveTab('mock-tests')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Mock Tests</span>
                <BookOpen size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                {metrics?.totalMockTests || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#7C3AED', fontWeight: 600, marginTop: '6px' }}>
                View question banks & tests &rarr;
              </div>
            </Card>

            {/* Pending Approvals */}
            <Card
              variant="glass"
              padding="md"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: '4px solid #F59E0B',
              }}
              onClick={() => setActiveTab('verification')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Pending Verifications</span>
                <Clock size={20} style={{ color: '#F59E0B' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#D97706', marginTop: '8px' }}>
                {pendingSchools.length}
              </div>
              <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, marginTop: '6px' }}>
                Awaiting principal credential review &rarr;
              </div>
            </Card>
          </div>

          {/* Quick Action & Hierarchy Shortcut Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Quick Institutions Directory Preview */}
            <Card variant="glass" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Recent Registered Schools
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('hierarchy')}>
                  Explore All ({allSchools.length}) &rarr;
                </Button>
              </div>

              {allSchools.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  No schools registered yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allSchools.slice(0, 4).map((s) => (
                    <div
                      key={s.school_id}
                      onClick={() => handleSelectSchool(s.school_id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {s.city}, {s.state} • {s.teacher_count || 0} Faculty • {s.student_count || 0} Students
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant={s.status === 'VERIFIED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'danger'}>
                          {s.status}
                        </Badge>
                        <ChevronRight size={16} style={{ color: '#94A3B8' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Platform Matrix & Analytics Teaser */}
            <Card variant="glass" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Platform Matrix & Status Breakdown
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('matrix')}>
                  Open Matrix &rarr;
                </Button>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Interactive status-wise analytics for Principals, Schools, Faculty, and Students. Drill into institutional
                and mentor-level cohorts with status distribution graphics.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  onClick={() => setActiveTab('matrix')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Principal Statuses</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {allSchools.length} Profiles
                  </div>
                  <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px', fontWeight: 600 }}>Active / Pending split</div>
                </div>

                <div
                  onClick={() => setActiveTab('matrix')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Faculty / Cohort Distribution</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {metrics?.class12Students || 0} Students
                  </div>
                  <div style={{ fontSize: '11px', color: '#0284C7', marginTop: '2px', fontWeight: 600 }}>Mentor mappings</div>
                </div>
              </div>

              <Button
                variant="gold"
                size="md"
                style={{ width: '100%', marginTop: '20px' }}
                onClick={() => setActiveTab('matrix')}
                icon={<Sparkles size={16} />}
              >
                Launch Platform Matrix Analytics
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INSTITUTIONS & HIERARCHY EXPLORER
          ========================================================================= */}
      {activeTab === 'hierarchy' && (
        <div>
          {/* Top Header & Breadcrumbs */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
              <span
                onClick={() => {
                  setSelectedSchoolHierarchy(null);
                  setSelectedTeacherDetails(null);
                }}
                style={{
                  cursor: selectedSchoolHierarchy ? 'pointer' : 'default',
                  color: selectedSchoolHierarchy ? '#E11D48' : '#0F172A',
                  fontWeight: selectedSchoolHierarchy ? 600 : 700,
                }}
              >
                Schools Directory ({allSchools.length})
              </span>

              {selectedSchoolHierarchy && (
                <>
                  <ChevronRight size={14} />
                  <span
                    onClick={() => setSelectedTeacherDetails(null)}
                    style={{
                      cursor: selectedTeacherDetails ? 'pointer' : 'default',
                      color: selectedTeacherDetails ? '#E11D48' : '#0F172A',
                      fontWeight: selectedTeacherDetails ? 600 : 700,
                    }}
                  >
                    {selectedSchoolHierarchy.school.name}
                  </span>
                </>
              )}

              {selectedTeacherDetails && (
                <>
                  <ChevronRight size={14} />
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>
                    Faculty: {selectedTeacherDetails.teacher.full_name}
                  </span>
                </>
              )}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {!selectedSchoolHierarchy
                ? 'Institutional Hierarchy Explorer'
                : selectedTeacherDetails
                ? `Faculty Cohort: ${selectedTeacherDetails.teacher.full_name}`
                : `${selectedSchoolHierarchy.school.name} — Institutional Hierarchy`}
            </h1>
          </div>

          {/* VIEW LEVEL 3: TEACHER ASSIGNED STUDENTS */}
          {selectedTeacherDetails ? (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => setSelectedTeacherDetails(null)}
                >
                  Back to {selectedSchoolHierarchy.school.name}
                </Button>
              </div>

              {/* Teacher Summary Card */}
              <Card variant="glass" padding="lg" style={{ marginBottom: '24px', borderLeft: '4px solid #0284C7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {selectedTeacherDetails.teacher.full_name}
                      </h2>
                      <Badge variant={selectedTeacherDetails.teacher.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {selectedTeacherDetails.teacher.status}
                      </Badge>
                      <Badge variant="info">
                        {selectedTeacherDetails.teacher.department || 'Faculty'}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                      Emp ID: <strong>{selectedTeacherDetails.teacher.teachers_emp_id || 'N/A'}</strong> | Email: {selectedTeacherDetails.teacher.email} | Phone: {selectedTeacherDetails.teacher.phone || 'N/A'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                      School: <strong>{selectedSchoolHierarchy.school.name}</strong> ({selectedSchoolHierarchy.school.city}, {selectedSchoolHierarchy.school.state})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Total Assigned Students</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284C7' }}>
                      {selectedTeacherDetails.totalStudents}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Students Table */}
              <Card variant="glass" padding="lg">
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
                  Assigned Students List ({selectedTeacherDetails.students.length})
                </h3>

                {selectedTeacherDetails.students.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: '14px' }}>
                    No students are currently linked to this faculty member.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: '12px 10px' }}>Student Name</th>
                          <th style={{ padding: '12px 10px' }}>Admission No</th>
                          <th style={{ padding: '12px 10px' }}>APAAR ID</th>
                          <th style={{ padding: '12px 10px' }}>Email</th>
                          <th style={{ padding: '12px 10px' }}>Phone</th>
                          <th style={{ padding: '12px 10px' }}>Status</th>
                          <th style={{ padding: '12px 10px' }}>Joined Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeacherDetails.students.map((st: any) => (
                          <tr key={st.student_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 10px', fontWeight: 700, color: '#0F172A' }}>
                              {st.full_name}
                            </td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>
                              {st.admission_no || 'N/A'}
                            </td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>
                              {st.apaar || 'N/A'}
                            </td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>
                              {st.email}
                            </td>
                            <td style={{ padding: '12px 10px', color: '#475569' }}>
                              {st.phone_no || 'N/A'}
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <Badge variant={st.status === 'VERIFIED' || st.status === 'ACTIVE' ? 'success' : 'warning'}>
                                {st.status}
                              </Badge>
                            </td>
                            <td style={{ padding: '12px 10px', color: '#64748B' }}>
                              {new Date(st.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          ) : selectedSchoolHierarchy ? (
            /* VIEW LEVEL 2: SCHOOL DRILL-DOWN (TEACHERS ROSTER + VIEW ALL STUDENTS OPTION) */
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => setSelectedSchoolHierarchy(null)}
                >
                  Back to Schools Directory
                </Button>
              </div>

              {/* School & Principal Profile Banner */}
              <Card variant="glass" padding="lg" style={{ marginBottom: '24px', borderLeft: '4px solid #E11D48' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {selectedSchoolHierarchy.school.name}
                      </h2>
                      <Badge variant={selectedSchoolHierarchy.school.status === 'VERIFIED' ? 'success' : 'warning'}>
                        {selectedSchoolHierarchy.school.status}
                      </Badge>
                      <Badge variant="default">
                        {selectedSchoolHierarchy.school.board_affiliation || 'CBSE'}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px', lineHeight: 1.5 }}>
                      Location: <strong>{selectedSchoolHierarchy.school.city}, {selectedSchoolHierarchy.school.state}</strong> (PIN: {selectedSchoolHierarchy.school.pin || 'N/A'})
                      <br />
                      Registration No: <strong>{selectedSchoolHierarchy.school.registration_no || 'N/A'}</strong> | Type: {selectedSchoolHierarchy.school.school_type || 'Private'}
                    </div>

                    {/* Principal Block */}
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#FEFCE8',
                        border: '1px solid #FEF08A',
                        display: 'inline-block',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9A751A', textTransform: 'uppercase' }}>
                        Institution Head / Principal
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                        {selectedSchoolHierarchy.principal?.full_name || 'No Principal Profile Created'}
                      </div>
                      {selectedSchoolHierarchy.principal && (
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          Email: {selectedSchoolHierarchy.principal.email} • Phone: {selectedSchoolHierarchy.principal.phone || 'N/A'} • Status: {selectedSchoolHierarchy.principal.status}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px 20px',
                        textAlign: 'center',
                        minWidth: '130px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Faculty</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                        {selectedSchoolHierarchy.summary?.totalTeachers || selectedSchoolHierarchy.teachers.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                        {selectedSchoolHierarchy.summary?.activeTeachers || 0} Active
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px 20px',
                        textAlign: 'center',
                        minWidth: '130px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Students</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                        {selectedSchoolHierarchy.summary?.totalStudents || selectedSchoolHierarchy.all_students.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                        {selectedSchoolHierarchy.summary?.activeStudents || 0} Active
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* View Toggle Bar: Faculty Roster vs All Students of this School */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant={hierarchySubView === 'teachers' ? 'primary' : 'ghost'}
                    size="md"
                    icon={<Users size={16} />}
                    onClick={() => setHierarchySubView('teachers')}
                  >
                    Faculty Roster ({selectedSchoolHierarchy.teachers.length})
                  </Button>

                  <Button
                    variant={hierarchySubView === 'all-students' ? 'gold' : 'ghost'}
                    size="md"
                    icon={<GraduationCap size={16} />}
                    onClick={() => setHierarchySubView('all-students')}
                  >
                    View All Students of this School ({selectedSchoolHierarchy.all_students.length})
                  </Button>
                </div>
              </div>

              {/* SUBVIEW 1: FACULTY ROSTER (Click teacher to drill down into their students) */}
              {hierarchySubView === 'teachers' && (
                <div>
                  {selectedSchoolHierarchy.teachers.length === 0 ? (
                    <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: '#64748B' }}>
                      <p>No faculty members have been onboarded by this school yet.</p>
                    </Card>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                      {selectedSchoolHierarchy.teachers.map((t: any) => (
                        <Card
                          key={t.teacher_id}
                          variant="glass"
                          padding="md"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid #E2E8F0',
                          }}
                          onClick={() => handleSelectTeacher(t.teacher_id)}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div>
                                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                  {t.full_name}
                                </h4>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                  Dept: <strong>{t.department || 'General'}</strong> | Emp ID: {t.teachers_emp_id || 'N/A'}
                                </div>
                              </div>
                              <Badge variant={t.status === 'ACTIVE' || t.status === 'VERIFIED' ? 'success' : 'warning'}>
                                {t.status}
                              </Badge>
                            </div>

                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '10px' }}>
                              Email: {t.email}
                              <br />
                              Phone: {t.phone || 'N/A'}
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: '16px',
                              paddingTop: '12px',
                              borderTop: '1px solid #F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284C7' }}>
                              {t.student_count || (t.students || []).length} Assigned Students
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#E11D48', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              View Students <ArrowRight size={14} />
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW 2: VIEW ALL STUDENTS OF THIS SCHOOL */}
              {hierarchySubView === 'all-students' && (
                <Card variant="glass" padding="lg">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        All Students Roster — {selectedSchoolHierarchy.school.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
                        Complete institutional list with admission numbers and mentor faculty mapping.
                      </p>
                    </div>

                    <div style={{ width: '280px' }}>
                      <Input
                        placeholder="Search student, admission, mentor..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        icon={<Search size={16} />}
                      />
                    </div>
                  </div>

                  {filteredSchoolStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: '14px' }}>
                      No students found matching your search.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                            <th style={{ padding: '12px 10px' }}>Student Name</th>
                            <th style={{ padding: '12px 10px' }}>Admission No</th>
                            <th style={{ padding: '12px 10px' }}>APAAR ID</th>
                            <th style={{ padding: '12px 10px' }}>Email</th>
                            <th style={{ padding: '12px 10px' }}>Phone</th>
                            <th style={{ padding: '12px 10px' }}>Assigned Faculty</th>
                            <th style={{ padding: '12px 10px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSchoolStudents.map((st: any) => (
                            <tr key={st.student_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px 10px', fontWeight: 700, color: '#0F172A' }}>
                                {st.full_name}
                              </td>
                              <td style={{ padding: '12px 10px', color: '#475569' }}>
                                {st.admission_no || 'N/A'}
                              </td>
                              <td style={{ padding: '12px 10px', color: '#475569' }}>
                                {st.apaar || 'N/A'}
                              </td>
                              <td style={{ padding: '12px 10px', color: '#475569' }}>
                                {st.email}
                              </td>
                              <td style={{ padding: '12px 10px', color: '#475569' }}>
                                {st.phone_no || 'N/A'}
                              </td>
                              <td style={{ padding: '12px 10px', color: '#0284C7', fontWeight: 600 }}>
                                {st.teacher_name}
                              </td>
                              <td style={{ padding: '12px 10px' }}>
                                <Badge variant={st.status === 'VERIFIED' || st.status === 'ACTIVE' ? 'success' : 'warning'}>
                                  {st.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}
            </div>
          ) : (
            /* VIEW LEVEL 1: ALL SCHOOLS DIRECTORY */
            <div>
              {/* Filter and Search Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <Input
                    placeholder="Search by school name, city, state, reg no, principal..."
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    icon={<Search size={18} />}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Status:</span>
                  {(['ALL', 'VERIFIED', 'PENDING', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSchoolStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: schoolStatusFilter === st ? 700 : 500,
                        backgroundColor: schoolStatusFilter === st ? '#0F172A' : '#FFFFFF',
                        color: schoolStatusFilter === st ? '#FFFFFF' : '#475569',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredSchools.length === 0 ? (
                <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: '#64748B' }}>
                  <p>No institutions match your search or filter parameters.</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredSchools.map((s) => (
                    <Card
                      key={s.school_id}
                      variant="glass"
                      padding="md"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => handleSelectSchool(s.school_id)}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {s.name}
                          </h3>
                          <Badge variant={s.status === 'VERIFIED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'danger'}>
                            {s.status}
                          </Badge>
                          <Badge variant="default">
                            {s.board_affiliation || 'CBSE'}
                          </Badge>
                        </div>

                        <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                          Location: <strong>{s.city}, {s.state}</strong> | Reg No: {s.registration_no || 'N/A'}
                        </div>

                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Principal: <strong>{s.principal?.full_name || 'Pending Onboarding'}</strong> ({s.principal?.email || 'N/A'})
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>FACULTY & COHORTS</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {s.teacher_count || 0} Faculty • {s.student_count || 0} Students
                          </div>
                        </div>

                        <Button
                          variant="gold"
                          size="sm"
                          icon={<ArrowRight size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSchool(s.school_id);
                          }}
                        >
                          Explore Hierarchy
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: PLATFORM MATRIX & STATUS ANALYTICS (SVG DONUT CHARTS)
          ========================================================================= */}
      {activeTab === 'matrix' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Platform Matrix & Multi-Dimensional Analytics
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Live status distributions across Principals, Schools, Faculty, and Student cohorts. Click any chart slice to filter exact records.
            </p>
          </div>

          {matrixLoading || !detailedMetrics ? (
            <LoadingSpinner message="Calculating platform distributions..." />
          ) : (
            <div>
              {/* SECTION 1: MACRO PLATFORM STATUS PIE CHARTS */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Global Platform Distribution (Macro Analytics)
                  </h2>
                  {activeChartFilter && (
                    <Badge variant="gold" size="sm">
                      Active Filter: {activeChartFilter.category.toUpperCase()} &rarr; {activeChartFilter.status}
                    </Badge>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {/* 1. Principals Status Pie Chart */}
                  <StatusPieChart
                    title="Principals by Status"
                    data={detailedMetrics.principalsAnalytics}
                    selectedStatus={activeChartFilter?.category === 'principals' ? activeChartFilter.status : null}
                    onSelectStatus={(status) => {
                      if (!status) setActiveChartFilter(null);
                      else setActiveChartFilter({ category: 'principals', status });
                    }}
                  />

                  {/* 2. Schools Status Pie Chart */}
                  <StatusPieChart
                    title="Schools by Status"
                    data={detailedMetrics.schoolsAnalytics}
                    selectedStatus={activeChartFilter?.category === 'schools' ? activeChartFilter.status : null}
                    onSelectStatus={(status) => {
                      if (!status) setActiveChartFilter(null);
                      else setActiveChartFilter({ category: 'schools', status });
                    }}
                  />

                  {/* 3. Teachers Status Pie Chart */}
                  <StatusPieChart
                    title="Teachers by Status"
                    data={detailedMetrics.teachersAnalytics}
                    selectedStatus={activeChartFilter?.category === 'teachers' ? activeChartFilter.status : null}
                    onSelectStatus={(status) => {
                      if (!status) setActiveChartFilter(null);
                      else setActiveChartFilter({ category: 'teachers', status });
                    }}
                  />

                  {/* 4. Students Status Pie Chart */}
                  <StatusPieChart
                    title="Students by Status"
                    data={detailedMetrics.studentsAnalytics}
                    selectedStatus={activeChartFilter?.category === 'students' ? activeChartFilter.status : null}
                    onSelectStatus={(status) => {
                      if (!status) setActiveChartFilter(null);
                      else setActiveChartFilter({ category: 'students', status });
                    }}
                  />
                </div>
              </div>

              {/* ACTIVE FILTER DRILL-DOWN ENTITY TABLE */}
              {activeChartFilter && matrixFilteredRecords && (
                <Card variant="glass" padding="lg" style={{ marginBottom: '36px', borderTop: '4px solid #E11D48' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Filtered Records: {activeChartFilter.category.toUpperCase()} with Status{' '}
                        <span style={{ color: '#E11D48' }}>"{activeChartFilter.status}"</span> ({matrixFilteredRecords.length})
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
                        Showing individual entity rows corresponding to the selected pie chart segment.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '220px' }}>
                        <Input
                          placeholder="Search in records..."
                          value={matrixSearch}
                          onChange={(e) => setMatrixSearch(e.target.value)}
                          icon={<Search size={15} />}
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveChartFilter(null)}>
                        Close Table
                      </Button>
                    </div>
                  </div>

                  {matrixFilteredRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '13px' }}>
                      No matching records found for this status.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                            <th style={{ padding: '10px' }}>Name / Institution</th>
                            <th style={{ padding: '10px' }}>Email / Contact</th>
                            <th style={{ padding: '10px' }}>Associated School</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Registered On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matrixFilteredRecords.map((r: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px', fontWeight: 700, color: '#0F172A' }}>
                                {r.full_name || r.name}
                              </td>
                              <td style={{ padding: '10px', color: '#475569' }}>
                                {r.email || r.phone || 'N/A'}
                              </td>
                              <td style={{ padding: '10px', color: '#475569' }}>
                                {r.school_name || r.school?.name || (r.city ? `${r.city}, ${r.state}` : 'Direct')}
                              </td>
                              <td style={{ padding: '10px' }}>
                                <Badge variant="warning">{r.status || activeChartFilter.status}</Badge>
                              </td>
                              <td style={{ padding: '10px', color: '#64748B' }}>
                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}

              {/* SECTION 2: MICRO ANALYTICS (PER-SCHOOL & PER-TEACHER DRILL-DOWN) */}
              <div style={{ marginTop: '36px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Institution & Faculty Micro Status Analytics
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                    Select an individual school to inspect faculty and student statuses within that specific institution and mentor.
                  </p>
                </div>

                {/* School Selector Bar */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <School size={18} style={{ color: '#E11D48' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Select Institution:</span>
                  </div>

                  <select
                    value={selectedMicroSchoolId}
                    onChange={(e) => {
                      setSelectedMicroSchoolId(e.target.value);
                      setSelectedMicroTeacherId('');
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      flex: 1,
                      maxWidth: '400px',
                    }}
                  >
                    {detailedMetrics.schoolsMicroAnalytics?.map((s: any) => (
                      <option key={s.school_id} value={s.school_id}>
                        {s.name} ({s.city}, {s.state}) — {s.total_teachers} Teachers, {s.total_students} Students
                      </option>
                    ))}
                  </select>

                  {selectedMicroSchool && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Badge variant="default">{selectedMicroSchool.city}, {selectedMicroSchool.state}</Badge>
                      <Badge variant={selectedMicroSchool.status === 'VERIFIED' ? 'success' : 'warning'}>
                        {selectedMicroSchool.status}
                      </Badge>
                    </div>
                  )}
                </div>

                {selectedMicroSchool ? (
                  <div>
                    {/* Micro Charts Grid for the Selected School */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                      {/* Teachers within that school */}
                      <StatusPieChart
                        title={`Teachers in ${selectedMicroSchool.name}`}
                        data={selectedMicroSchool.teachers_by_status}
                      />

                      {/* Students within that school */}
                      <StatusPieChart
                        title={`Students in ${selectedMicroSchool.name}`}
                        data={selectedMicroSchool.students_by_status}
                      />
                    </div>

                    {/* Faculty-Specific Student Micro Analytics */}
                    <Card variant="glass" padding="lg">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            Faculty-Specific Student Status Analytics
                          </h3>
                          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
                            Pick a faculty member in {selectedMicroSchool.name} to view the status distribution of students assigned to them.
                          </p>
                        </div>

                        <select
                          value={selectedMicroTeacherId}
                          onChange={(e) => setSelectedMicroTeacherId(e.target.value)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            minWidth: '280px',
                          }}
                        >
                          <option value="">-- Choose Faculty Member --</option>
                          {selectedMicroSchool.teachers.map((t: any) => (
                            <option key={t.teacher_id} value={t.teacher_id}>
                              {t.full_name} ({t.department || 'General'}) — {t.total_students} Assigned
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedMicroTeacher ? (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                          <div style={{ width: '100%', maxWidth: '420px' }}>
                            <StatusPieChart
                              title={`Students of ${selectedMicroTeacher.full_name} (${selectedMicroTeacher.total_students})`}
                              data={selectedMicroTeacher.students_by_status}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '13px' }}>
                          Select any faculty member above to generate status analytics for their specific student cohort.
                        </div>
                      )}
                    </Card>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
                    No school records available.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: MOCK TESTS EXPLORER (STRICTLY VIEW-ONLY, NO CREATE, NO EXAM ADMIN)
          ========================================================================= */}
      {activeTab === 'mock-tests' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Class 12 Standardized Mock Assessments (View Only)
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Institutional examination repository. Super Admin has view-only auditing privileges. Question authoring
              is strictly managed in the dedicated Exam Admin Portal.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ flex: 1, minWidth: '260px' }}>
              <Input
                placeholder="Search by test title, syllabus, or subject..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Subject:</span>
              <button
                onClick={() => setSelectedSubjectFilter('ALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: selectedSubjectFilter === 'ALL' ? 700 : 500,
                  backgroundColor: selectedSubjectFilter === 'ALL' ? '#0F172A' : '#FFFFFF',
                  color: selectedSubjectFilter === 'ALL' ? '#FFFFFF' : '#475569',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              >
                All Subjects
              </button>
              {uniqueSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubjectFilter(sub)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: selectedSubjectFilter === sub ? 700 : 500,
                    backgroundColor: selectedSubjectFilter === sub ? '#0F172A' : '#FFFFFF',
                    color: selectedSubjectFilter === sub ? '#FFFFFF' : '#475569',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {testLoading ? (
            <LoadingSpinner message="Querying mock test assessments..." />
          ) : filteredMockTests.length === 0 ? (
            <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: '#64748B' }}>
              <p>No mock tests found matching your search.</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredMockTests.map((t) => (
                <Card
                  key={t.mock_test_id}
                  variant="glass"
                  padding="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {t.title}
                      </h3>
                      <Badge variant="gold">
                        {t.subject?.name || 'All Subjects'}
                      </Badge>
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
                      {t.description || 'Standardized curriculum evaluation.'}
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        marginTop: '12px',
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Questions</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{t.total_questions}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Marks</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{t.max_marks}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Duration</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{t.max_time_in_mins}m</div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      {t.negative_marking ? 'Negative Marking (+4 / -1)' : 'No Negative Marking'}
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => handleInspectTest(t.mock_test_id)}
                    >
                      Inspect Test Paper
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* READ-ONLY TEST INSPECTION & PLATFORM ANALYTICS MODAL */}
          <Modal
            isOpen={inspectModalOpen}
            onClose={() => {
              setInspectModalOpen(false);
              setInspectingTest(null);
              setInspectAnalyticsData(null);
            }}
            title={inspectingTest?.title || 'Mock Test Inspection & Platform Analytics'}
            maxWidth="1000px"
          >
            {inspectingLoading ? (
              <LoadingSpinner message="Retrieving calibrated test paper, candidate attempts & platform analytics..." />
            ) : inspectingTest ? (
              <div>
                {/* Test Meta Header Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Badge variant="gold">{inspectingTest.subject?.name || 'All Subjects'}</Badge>
                  <Badge variant="default">{inspectingTest.total_questions} Questions</Badge>
                  <Badge variant="default">{inspectingTest.max_marks} Max Marks</Badge>
                  <Badge variant="default">{inspectingTest.max_time_in_mins} Minutes Duration</Badge>
                  <Badge variant={inspectingTest.negative_marking ? 'danger' : 'success'}>
                    {inspectingTest.negative_marking ? 'Negative Marking (+4 / -1)' : 'No Negative Penalty'}
                  </Badge>
                  {inspectingTest.passing_marks && (
                    <Badge variant="info">Passing: {inspectingTest.passing_marks} Marks</Badge>
                  )}
                </div>

                {inspectingTest.description && (
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                    <strong>Syllabus / Instructions:</strong> {inspectingTest.description}
                  </p>
                )}

                {/* Modal View Switcher */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    borderBottom: '2px solid #E2E8F0',
                    paddingBottom: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <Button
                    variant={inspectModalTab === 'analytics' ? 'primary' : 'ghost'}
                    size="sm"
                    icon={<Users size={15} />}
                    onClick={() => setInspectModalTab('analytics')}
                  >
                    Platform Performance & Candidate Roster ({inspectAnalyticsData?.candidates?.length || 0})
                  </Button>
                  <Button
                    variant={inspectModalTab === 'questions' ? 'primary' : 'ghost'}
                    size="sm"
                    icon={<BookOpen size={15} />}
                    onClick={() => setInspectModalTab('questions')}
                  >
                    Paper Questions & Blueprint ({inspectingTest.questions?.length || 0})
                  </Button>
                </div>

                {/* VIEW 1: PLATFORM PERFORMANCE & CANDIDATES ROSTER */}
                {inspectModalTab === 'analytics' && (
                  <div>
                    {/* Platform Analytics KPI Tiles */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Total Attempts</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                          {inspectAnalyticsData?.analytics?.totalAttempts || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0284C7', marginTop: '2px' }}>Enrolled Students</div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Average Correct</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                          {inspectAnalyticsData?.analytics?.averageCorrect ?? 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          out of {inspectingTest.total_questions} Questions
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Highest Score</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#9A751A', marginTop: '2px' }}>
                          {inspectAnalyticsData?.analytics?.highestScore ?? 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          out of {inspectingTest.max_marks} Marks
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Average Platform Score</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284C7', marginTop: '2px' }}>
                          {inspectAnalyticsData?.analytics?.averageScore ?? 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px', fontWeight: 600 }}>
                          {inspectAnalyticsData?.analytics?.averagePercentage ?? 0}% Mean Accuracy
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Participating Schools</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
                          {inspectAnalyticsData?.analytics?.participatingSchoolsCount || 0}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Across Platform</div>
                      </div>
                    </div>

                    {/* Candidate Search & Table */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                        Candidate Submissions ({filteredCandidates.length})
                      </div>
                      <div style={{ width: '280px' }}>
                        <Input
                          placeholder="Search candidate, school, teacher..."
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          icon={<Search size={15} />}
                        />
                      </div>
                    </div>

                    {filteredCandidates.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8', fontSize: '13px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                        {inspectAnalyticsData?.candidates?.length === 0
                          ? 'No students have attempted this mock test yet across the platform.'
                          : 'No candidate attempts match your search query.'}
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto', maxHeight: '400px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F8FAFC', zIndex: 10 }}>
                            <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                              <th style={{ padding: '10px' }}>Rank / Candidate</th>
                              <th style={{ padding: '10px' }}>School / Institution</th>
                              <th style={{ padding: '10px' }}>Assigned Faculty</th>
                              <th style={{ padding: '10px' }}>Score</th>
                              <th style={{ padding: '10px' }}>Accuracy</th>
                              <th style={{ padding: '10px' }}>Answers (C/W/S)</th>
                              <th style={{ padding: '10px' }}>Time Taken</th>
                              <th style={{ padding: '10px' }}>Submitted On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCandidates.map((c: any) => (
                              <tr key={c.attempt_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        backgroundColor: c.rank <= 3 ? '#FEF08A' : '#F1F5F9',
                                        color: c.rank <= 3 ? '#9A751A' : '#475569',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {c.rank}
                                    </span>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.student_name}</div>
                                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                                        Adm: {c.admission_no || 'N/A'} {c.apaar ? `• APAAR: ${c.apaar}` : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '10px' }}>
                                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{c.school_name}</div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>{c.school_location}</div>
                                </td>
                                <td style={{ padding: '10px' }}>
                                  <div style={{ fontWeight: 600, color: '#0284C7' }}>{c.teacher_name}</div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>Dept: {c.teacher_dept}</div>
                                </td>
                                <td style={{ padding: '10px' }}>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 800,
                                      color: c.score_obtained >= (inspectingTest.passing_marks || 0) ? '#10B981' : '#E11D48',
                                    }}
                                  >
                                    {c.score_obtained}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748B' }}> / {inspectingTest.max_marks}</span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                  <Badge variant={c.percentage >= 60 ? 'success' : c.percentage >= 40 ? 'gold' : 'danger'}>
                                    {c.percentage}%
                                  </Badge>
                                </td>
                                <td style={{ padding: '10px' }}>
                                  <div style={{ display: 'flex', gap: '4px', fontSize: '11px' }}>
                                    <span style={{ color: '#10B981', fontWeight: 700 }}>{c.correct_ans}C</span>
                                    <span style={{ color: '#94A3B8' }}>/</span>
                                    <span style={{ color: '#E11D48', fontWeight: 700 }}>{c.wrong_ans}W</span>
                                    <span style={{ color: '#94A3B8' }}>/</span>
                                    <span style={{ color: '#64748B' }}>{c.unanswered}S</span>
                                  </div>
                                </td>
                                <td style={{ padding: '10px', color: '#475569' }}>
                                  {Math.floor(c.time_taken / 60)}m {c.time_taken % 60}s
                                </td>
                                <td style={{ padding: '10px', color: '#64748B', whiteSpace: 'nowrap' }}>
                                  {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW 2: QUESTIONS & BLUEPRINT INSPECTION */}
                {inspectModalTab === 'questions' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Paper Questions ({inspectingTest.questions?.length || 0})
                      </h4>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        Correct answers highlighted with green badges for administrator review.
                      </span>
                    </div>

                    {(!inspectingTest.questions || inspectingTest.questions.length === 0) ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                        Questions have not been linked to this paper yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '460px', overflowY: 'auto' }}>
                        {inspectingTest.questions.map((q: any, idx: number) => (
                          <div
                            key={q.question_id || idx}
                            style={{
                              padding: '14px',
                              borderRadius: '10px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#F8FAFC',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>
                                Question {idx + 1} ({q.question_type || 'MCQ'})
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                Marks: +{q.marks_per_question || 4} / -{q.negative_marking ?? 1}
                              </span>
                            </div>

                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                              {q.question_text}
                            </div>

                            {q.question_image_url && (
                              <img
                                src={q.question_image_url}
                                alt={`Question ${idx + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '180px', marginTop: '10px', borderRadius: '6px' }}
                              />
                            )}

                            {q.option_array && Array.isArray(q.option_array) && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' }}>
                                {q.option_array.map((opt: any, oIdx: number) => {
                                  const key = typeof opt === 'object' ? opt.key : ['A', 'B', 'C', 'D'][oIdx];
                                  const text = typeof opt === 'object' ? opt.text : String(opt);
                                  const isCorrect =
                                    q.answers?.correct === key ||
                                    q.answers?.key === key ||
                                    (Array.isArray(q.answers) && q.answers.includes(key));

                                  return (
                                    <div
                                      key={oIdx}
                                      style={{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        border: isCorrect ? '1px solid #10B981' : '1px solid #E2E8F0',
                                        backgroundColor: isCorrect ? '#ECFDF5' : '#FFFFFF',
                                        fontSize: '12px',
                                        color: isCorrect ? '#065F46' : '#334155',
                                        fontWeight: isCorrect ? 700 : 400,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
                                      <span style={{ fontWeight: 700 }}>{key}.</span>
                                      <span>{text}</span>
                                      {isCorrect && (
                                        <CheckCircle size={13} style={{ color: '#10B981', marginLeft: 'auto' }} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInspectModalOpen(false);
                      setInspectingTest(null);
                      setInspectAnalyticsData(null);
                    }}
                  >
                    Close Inspector
                  </Button>
                </div>
              </div>
            ) : null}
          </Modal>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SCHOOL VERIFICATION QUEUE
          ========================================================================= */}
      {activeTab === 'verification' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Institutional Verification Queue
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Newly registered institutions requiring official administrative authentication before activating faculty & student onboarding.
            </p>
          </div>

          {pendingSchools.length === 0 ? (
            <Card variant="glass" padding="lg" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <CheckCircle size={48} style={{ color: '#10B981', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Verification Queue Clear
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
                All submitted school registrations have been reviewed and verified.
              </p>
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
                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{s.name}</h3>
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
    </PortalSidebarLayout>
  );
};
