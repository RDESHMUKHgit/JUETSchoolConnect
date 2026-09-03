import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { principalApi } from '../../api/principal.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
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
  Mail,
  Lock,
  User,
} from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Teacher Modal state
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState<string | null>(null);
  const [teacherErr, setTeacherErr] = useState<string | null>(null);

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFullName || !teacherEmail || !teacherPassword) {
      setTeacherErr('Please provide teacher full name, email, and temporary password.');
      return;
    }

    try {
      setTeacherLoading(true);
      setTeacherErr(null);
      setTeacherMsg(null);
      const res = await principalApi.createTeacher({
        full_name: teacherFullName,
        email: teacherEmail,
        password: teacherPassword,
      });
      setTeacherMsg(res.message || 'Teacher provisioned successfully!');
      setTeacherFullName('');
      setTeacherEmail('');
      setTeacherPassword('');
      // Reload statistics
      const s = await principalApi.getStats();
      if (s.success) setStats(s.stats);
    } catch (err: any) {
      setTeacherErr(err.message || 'Failed to provision teacher.');
    } finally {
      setTeacherLoading(false);
    }
  };

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
            <Button variant="gold" size="sm" icon={<UserPlus size={16} />} onClick={() => setIsAddTeacherOpen(true)}>
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
              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/principal/students')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Class 12 Students</span>
                  <GraduationCap size={20} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {stats?.totalClass12Students || 0}
                </div>
                <div style={{ fontSize: '12px', color: stats?.pendingStudents > 0 ? '#D97706' : '#059669', marginTop: '4px', fontWeight: 500 }}>
                  {stats?.pendingStudents > 0 ? `${stats.pendingStudents} awaiting your approval &rarr;` : 'All enrolled approved &rarr;'}
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/principal/teachers')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Teaching Faculty</span>
                  <Users size={20} style={{ color: '#0284C7' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {stats?.totalTeachers || 0}
                </div>
                <div style={{ fontSize: '12px', color: stats?.pendingTeachers > 0 ? '#D97706' : '#0284C7', marginTop: '4px', fontWeight: 500 }}>
                  {stats?.pendingTeachers > 0 ? `${stats.pendingTeachers} pending approval &rarr;` : 'Active faculty roster &rarr;'}
                </div>
              </Card>

              <Card
                variant="glass"
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onClick={() => navigate('/principal/mock-tests')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Standardized Mock Tests</span>
                  <BookOpen size={20} style={{ color: '#9A751A' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  Class 12
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Inspect papers & syllabi &rarr;
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

      {/* Add Teacher Modal in Principal Cockpit */}
      <Modal
        isOpen={isAddTeacherOpen}
        onClose={() => {
          setIsAddTeacherOpen(false);
          setTeacherErr(null);
          setTeacherMsg(null);
        }}
        title="Provision Teaching Faculty"
        maxWidth="500px"
      >
        {teacherMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '13px', marginBottom: '16px' }}>
            {teacherMsg}
          </div>
        )}

        {teacherErr && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
            {teacherErr}
          </div>
        )}

        <form onSubmit={handleAddTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Teacher Full Name"
            type="text"
            placeholder="Dr. Sangeeta Sharma"
            value={teacherFullName}
            onChange={(e) => setTeacherFullName(e.target.value)}
            icon={<User size={16} />}
            helperText="Official name of the faculty member."
            required
          />

          <Input
            label="Official Teacher Email"
            type="email"
            placeholder="sangeeta.physics@school.edu.in"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />

          <Input
            label="Temporary Password"
            type="password"
            placeholder="••••••••••••"
            value={teacherPassword}
            onChange={(e) => setTeacherPassword(e.target.value)}
            icon={<Lock size={16} />}
            helperText="The teacher will use this password to sign in."
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddTeacherOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              loading={teacherLoading}
              icon={<UserPlus size={16} />}
            >
              Provision Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </PortalSidebarLayout>
  );
};
