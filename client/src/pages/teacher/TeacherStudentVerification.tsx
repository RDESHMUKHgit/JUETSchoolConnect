import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { getTeacherNavItems } from '../../utils/navigation.js';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const TeacherStudentVerification: React.FC = () => {
  const { user } = useAuth();
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getPendingStudents({ page, limit });
      if (res.success) {
        setPendingStudents(res.pendingStudents || []);
        setTotalCount(res.total !== undefined ? res.total : (res.pendingStudents?.length || 0));
      }
    } catch (err) {
      console.error('Failed to load pending students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [page, limit]);

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

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const navItems = getTeacherNavItems(totalCount);

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
                Student Verification Queue
              </h1>
              <Badge variant="warning">Pending Verifications ({totalCount})</Badge>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              Candidates who have set their permanent password and completed their details. Review their academic profiles to activate their mock test cockpit.
            </p>
          </div>

          {/* Page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
              }}
            >
              {[5, 10, 20, 50, 100].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
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
                      {st.profile_photo_url ? (
                        <img
                          src={st.profile_photo_url}
                          alt={st.full_name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {(st.full_name || 'S').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {st.full_name}
                        </h3>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                          <Badge variant="warning">STATUS: PENDING</Badge>
                          <Badge variant="default">Class 12</Badge>
                        </div>
                      </div>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} of {totalCount} candidates
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    icon={<ChevronLeft size={14} />}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    icon={<ChevronRight size={14} />}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
