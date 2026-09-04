import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  UploadCloud,
  BookOpen,
  Target,
  Mail,
  Phone,
  Calendar,
  IdCard,
} from 'lucide-react';

export const TeacherStudentVerification: React.FC = () => {
  const { user } = useAuth();
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getPendingStudents();
      if (res.success) {
        setPendingStudents(res.pendingStudents || []);
      }
    } catch (err) {
      console.error('Failed to load pending students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (studentId: string) => {
    try {
      setActionLoadingId(studentId);
      const res = await teacherApi.verifyStudent(studentId);
      setActionMessage(res.message || 'Student verified and activated successfully.');
      await loadPending();
    } catch (err: any) {
      setActionMessage('Failed to approve student: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (studentId: string) => {
    if (!confirm('Are you sure you want to reject this student enrollment?')) return;
    try {
      setActionLoadingId(studentId);
      const res = await teacherApi.rejectStudent(studentId);
      setActionMessage(res.message || 'Student enrollment rejected.');
      await loadPending();
    } catch (err: any) {
      setActionMessage('Failed to reject student: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} /> },
    { label: 'Upload CSV (Students)', path: '/teacher/students/upload', icon: <UploadCloud size={18} /> },
    { label: 'Pending Verifications', path: '/teacher/students/verification', icon: <UserCheck size={18} />, badge: pendingStudents.length > 0 ? `${pendingStudents.length}` : undefined },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
              Student Verification Queue
            </h1>
            <Badge variant="warning">{pendingStudents.length} Pending</Badge>
          </div>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Candidates who have set their permanent password and completed their details. Review their academic profiles to activate their mock test cockpit.
          </p>
        </div>

        {actionMessage && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: actionMessage.includes('Failed') ? '#FEF2F2' : '#ECFDF5',
              border: actionMessage.includes('Failed') ? '1px solid #FECACA' : '1px solid #A7F3D0',
              color: actionMessage.includes('Failed') ? '#DC2626' : '#047857',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'inherit' }}>
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Querying pending candidate profiles..." />
        ) : pendingStudents.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#059669', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>
              Verification Queue Clear
            </h3>
            <p style={{ color: '#475569', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
              All submitted Class 12 candidates have been verified. When new students submit their onboarding forms, they will appear here.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingStudents.map((st) => (
              <Card key={st.student_id} variant="glass" padding="lg" style={{ borderLeft: '4px solid #F59E0B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                        {st.full_name}
                      </h3>
                      <Badge variant="warning">STATUS: PENDING</Badge>
                      <Badge variant="default">Class 12</Badge>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        Admission No: <strong style={{ color: '#0F172A' }}>{st.admission_no || 'N/A'}</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        APAAR ID: <strong style={{ color: '#0F172A' }}>{st.apaar || 'N/A'}</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        Email: <strong style={{ color: '#0F172A' }}>{st.email}</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        Phone: <strong style={{ color: '#0F172A' }}>{st.phone_no || 'N/A'}</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        DOB: <strong style={{ color: '#0F172A' }}>{st.dob ? new Date(st.dob).toLocaleDateString() : 'N/A'}</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        Gender: <strong style={{ color: '#0F172A' }}>{st.gender || 'N/A'}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>
                      Profile Submitted on {new Date(st.updated_at || st.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Button
                      variant="gold"
                      size="sm"
                      icon={<CheckCircle size={15} />}
                      loading={actionLoadingId === st.student_id}
                      onClick={() => handleApprove(st.student_id)}
                    >
                      Verify & Activate
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle size={15} />}
                      loading={actionLoadingId === st.student_id}
                      onClick={() => handleReject(st.student_id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
