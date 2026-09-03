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
import { BookOpen, Users, GraduationCap, Target, ArrowRight, TrendingUp } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sRes, tRes] = await Promise.all([
          teacherApi.getStudents().catch(() => ({ students: [] })),
          testApi.getMockTests().catch(() => ({ mockTests: [] })),
        ]);
        setStudents(sRes.students || []);
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
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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

        {loading ? (
          <LoadingSpinner message="Loading academic diagnostics..." />
        ) : (
          <>
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Verified Students</span>
                  <GraduationCap size={20} style={{ color: '#0284C7' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {students.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Enrolled Class 12 candidates
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Published Mock Tests</span>
                  <Target size={20} style={{ color: '#9A751A' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {mockTests.length}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Standardized curriculum tests
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Academic Focus</span>
                  <TrendingUp size={20} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '12px' }}>
                  Board & JEE Ready
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Precision topic diagnostics
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <Card variant="glass" padding="lg">
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Class 12 Student Directory
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Inspect all verified Class 12 students in your school. Deep-dive into individual test attempt histories, time management, and topic weaknesses.
                </p>
                <Button variant="gold" size="sm" icon={<ArrowRight size={16} />} onClick={() => navigate('/teacher/students')}>
                  Open Student Directory
                </Button>
              </Card>

              <Card variant="glass" padding="lg">
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Mock Test Blueprints (View Only)
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Examine upcoming test syllabus and question counts to coordinate your classroom revision schedule.
                </p>
                <Button variant="secondary" size="sm" icon={<ArrowRight size={16} />} onClick={() => navigate('/teacher/mock-tests')}>
                  View Active Tests
                </Button>
              </Card>
            </div>
          </>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
