import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  BookOpen,
  Users,
  GraduationCap,
  Target,
  ArrowRight,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sRes, pRes, tRes] = await Promise.all([
          teacherApi.getStudents().catch(() => ({ students: [] })),
          teacherApi.getPendingStudents().catch(() => ({ pendingStudents: [] })),
          testApi.getMockTests().catch(() => ({ mockTests: [] })),
        ]);
        setStudents(sRes.students || []);
        setPendingStudents(pRes.pendingStudents || []);
        setMockTests(tRes.mockTests || []);
      } catch (err) {
        console.error('Error loading teacher data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const navItems = [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} />, badge: `${students.length}` },
    { label: 'Upload CSV (Students)', path: '/teacher/students/upload', icon: <UploadCloud size={18} /> },
    {
      label: 'Pending Verifications',
      path: '/teacher/students/verification',
      icon: <UserCheck size={18} />,
      badge: pendingStudents.length > 0 ? `${pendingStudents.length}` : undefined,
    },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
                Welcome, {user?.fullName || 'Faculty'}
              </h1>
              <Badge variant="info">TEACHER</Badge>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              {user?.schoolName} — Class 12 Academic Cockpit & Student Diagnostics
            </p>
          </div>

          <Button
            variant="gold"
            size="sm"
            icon={<UploadCloud size={16} />}
            onClick={() => navigate('/teacher/students/upload')}
          >
            Upload Student CSV
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading academic diagnostics..." />
        ) : (
          <>
            {/* Clickable Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/teacher/students')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Verified Students</span>
                  <GraduationCap size={20} style={{ color: '#0284C7' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {students.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Active Class 12 candidates &rarr;
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{
                  cursor: 'pointer',
                  borderLeft: pendingStudents.length > 0 ? '4px solid #F59E0B' : undefined,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onClick={() => navigate('/teacher/students/verification')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Pending Verification</span>
                  <UserCheck size={20} style={{ color: '#D97706' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: pendingStudents.length > 0 ? '#D97706' : '#0F172A', marginTop: '8px' }}>
                  {pendingStudents.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Awaiting review &rarr;
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/teacher/mock-tests')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Published Mock Tests</span>
                  <Target size={20} style={{ color: '#9A751A' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {mockTests.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Standardized curriculum tests &rarr;
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <Card variant="glass" padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <UploadCloud size={20} style={{ color: '#2563EB' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Bulk Student Onboarding
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>
                  Upload a 2-column CSV (name and email) to provision student logins instantly. Temporary passwords are generated automatically.
                </p>
                <Button variant="gold" size="sm" icon={<ArrowRight size={15} />} onClick={() => navigate('/teacher/students/upload')}>
                  Upload Student CSV
                </Button>
              </Card>

              <Card variant="glass" padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <UserCheck size={20} style={{ color: '#059669' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Verification Queue ({pendingStudents.length})
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>
                  Inspect students who set their permanent password and completed their details. Approve to activate their mock test access.
                </p>
                <Button variant="secondary" size="sm" icon={<ArrowRight size={15} />} onClick={() => navigate('/teacher/students/verification')}>
                  Review Pending Students
                </Button>
              </Card>

              <Card variant="glass" padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Target size={20} style={{ color: '#9A751A' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Mock Test Papers & Solutions
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>
                  Inspect all 5-question test papers, options, and verified answer keys created by the examination admin.
                </p>
                <Button variant="secondary" size="sm" icon={<ArrowRight size={15} />} onClick={() => navigate('/teacher/mock-tests')}>
                  Inspect Mock Papers
                </Button>
              </Card>
            </div>
          </>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
