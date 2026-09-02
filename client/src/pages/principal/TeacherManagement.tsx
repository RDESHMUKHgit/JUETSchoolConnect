import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { principalApi } from '../../api/principal.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { Users, UserPlus, CheckCircle, Mail, Lock, ShieldCheck } from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New teacher manual creation form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const res = await principalApi.getTeachers();
      if (res.success) {
        setTeachers(res.teachers || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      setError('Please provide both teacher email and password.');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);
      setMessage(null);
      const res = await principalApi.createTeacher({
        email: newEmail,
        password: newPassword,
      });
      setMessage(res.message || 'Teacher credentials created successfully.');
      setNewEmail('');
      setNewPassword('');
      await loadTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      setError(null);
      const res = await principalApi.approveTeacher(teacherId);
      setMessage(res.message || 'Teacher approved successfully.');
      await loadTeachers();
    } catch (err: any) {
      setError('Failed to approve teacher: ' + err.message);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/principal', icon: <Users size={18} /> },
    { label: 'Manage Teachers', path: '/principal/teachers', icon: <Users size={18} /> },
    { label: 'Class 12 Students', path: '/principal/students', icon: <Users size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <Users size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'School Cockpit'} portalRole="PRINCIPAL" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
            Faculty & Teacher Management
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Provision teacher credentials and verify incoming faculty registrations.
          </p>
        </div>

        {/* Informative Guidance Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FEFCE8', padding: '14px 18px', borderRadius: '10px', border: '1px solid #FEF08A' }}>
          <ShieldCheck size={20} style={{ color: '#9A751A', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
            <strong>How Faculty Onboarding Works:</strong> You enter the teacher's Email & Password below. The teacher then logs in from the base website using those credentials, enters their Full Name and academic specialization, and their status moves to <strong style={{ color: '#B45309' }}>PENDING</strong>. As Principal, you click <strong>Approve</strong> below to unlock their portal.
          </p>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Section 1: Provision New Teacher Form */}
        <Card variant="glass" padding="lg" style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <UserPlus size={20} style={{ color: '#9A751A' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              Create New Teacher Credentials
            </h3>
          </div>

          <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Teacher Official Email"
                type="email"
                placeholder="sangeeta.physics@school.edu.in"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
              <Input
                label="Temporary Password"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock size={16} />}
                helperText="Provide this password to the teacher to sign in."
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              loading={createLoading}
              icon={<UserPlus size={16} />}
              style={{ alignSelf: 'flex-start' }}
            >
              Provision Teacher Account
            </Button>
          </form>
        </Card>

        {/* Section 2: Faculty Roster & Approval Queue */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
            School Faculty Roster ({teachers.length})
          </h2>

          {loading ? (
            <LoadingSpinner message="Loading teacher records..." />
          ) : teachers.length === 0 ? (
            <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
              <Users size={36} style={{ color: '#64748B', margin: '0 auto 10px' }} />
              <p style={{ color: '#475569' }}>No faculty members provisioned yet. Use the form above to add your first teacher.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teachers.map((t) => (
                <Card key={t.teacher_id} variant="glass" padding="md">
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                          {t.full_name || <em style={{ color: '#64748B' }}>Name Pending Setup</em>}
                        </h4>
                        <Badge
                          variant={
                            t.status === 'VERIFIED'
                              ? 'success'
                              : t.status === 'PENDING'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {t.status}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                        Email: <strong>{t.email}</strong> | Department: {t.department || 'N/A'} | Subject: {t.specialization || 'N/A'}
                      </div>
                      {t.phone && (
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Phone: {t.phone} | Qualification: {t.qualification || 'N/A'}
                        </div>
                      )}
                    </div>

                    <div>
                      {t.status === 'PENDING' && (
                        <Button
                          variant="gold"
                          size="sm"
                          icon={<CheckCircle size={15} />}
                          onClick={() => handleApproveTeacher(t.teacher_id)}
                        >
                          Approve Teacher
                        </Button>
                      )}
                      {(t.status === 'NOT_COMPLETED' || t.status === 'NOT COMPLETED') && (
                        <span style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                          Awaiting teacher first login
                        </span>
                      )}
                      {(t.status === 'VERIFIED' || t.status === 'ACTIVE') && (
                        <Badge variant="success" size="sm">Active Faculty</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalSidebarLayout>
  );
};
