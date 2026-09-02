import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { principalApi } from '../../api/principal.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  UserPlus,
} from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await principalApi.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Error loading principal stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const navItems = [
    { label: 'Overview', path: '/principal', icon: <School size={18} /> },
    { label: 'Manage Teachers', path: '/principal/teachers', icon: <Users size={18} />, badge: stats?.pendingTeachers > 0 ? `${stats.pendingTeachers} new` : undefined },
    { label: 'Class 12 Students', path: '/principal/students', icon: <GraduationCap size={18} />, badge: stats?.pendingStudents > 0 ? `${stats.pendingStudents} pending` : undefined },
    { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <BookOpen size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'School Cockpit'} portalRole="PRINCIPAL" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
                Principal Cockpit
              </h1>
              <Badge variant="success">School: VERIFIED</Badge>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              {user?.schoolName || 'Your High School'} — Institutional Administration Dashboard
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="gold" size="sm" icon={<UserPlus size={16} />} onClick={() => navigate('/principal/teachers')}>
              Add New Teacher
            </Button>
            <Button variant="secondary" size="sm" icon={<GraduationCap size={16} />} onClick={() => navigate('/principal/students')}>
              Review Students
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading institutional statistics..." />
        ) : (
          <>
            {/* Live Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Class 12 Students</span>
                  <GraduationCap size={20} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {stats?.totalClass12Students || 0}
                </div>
                <div style={{ fontSize: '12px', color: stats?.pendingStudents > 0 ? '#D97706' : '#059669', marginTop: '4px', fontWeight: 500 }}>
                  {stats?.pendingStudents > 0 ? `${stats.pendingStudents} awaiting your approval` : 'All enrolled approved'}
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Teaching Faculty</span>
                  <Users size={20} style={{ color: '#0284C7' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {stats?.totalTeachers || 0}
                </div>
                <div style={{ fontSize: '12px', color: stats?.pendingTeachers > 0 ? '#D97706' : '#0284C7', marginTop: '4px', fontWeight: 500 }}>
                  {stats?.pendingTeachers > 0 ? `${stats.pendingTeachers} pending profile completion/approval` : 'Active faculty roster'}
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Academic Focus</span>
                  <BookOpen size={20} style={{ color: '#9A751A' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  Class 12
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  CBSE / ICSE Standardized Prep
                </div>
              </Card>

              <Card variant="glass" padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Institutional Status</span>
                  <CheckCircle size={20} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '8px' }}>
                  Verified
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Accredited by Jaypee Connect
                </div>
              </Card>
            </div>

            {/* Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <Card variant="glass" padding="lg">
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Teacher Management
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Manually provision credentials (Email and Password) for your teaching faculty. Teachers can then log in on the base website to complete their profiles.
                </p>
                <Button variant="gold" size="sm" icon={<ArrowRight size={16} />} onClick={() => navigate('/principal/teachers')}>
                  Open Faculty Roster
                </Button>
              </Card>

              <Card variant="glass" padding="lg">
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Class 12 Student Enrollments
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Review Class 12 students who selected your school during self-registration. Verify admission numbers and approve access to standardized mock tests.
                </p>
                <Button variant="secondary" size="sm" icon={<ArrowRight size={16} />} onClick={() => navigate('/principal/students')}>
                  Open Student Directory
                </Button>
              </Card>
            </div>
          </>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
