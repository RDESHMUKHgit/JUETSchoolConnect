import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { getTeacherNavItems } from '../../utils/navigation.js';
import {
  GraduationCap,
  BarChart2,
  Search,
  UserPlus,
  Info,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  Mail,
  Calendar,
  IdCard,
  Ban,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';

export const TeacherStudentDirectory: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'NOT_COMPLETED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Compute status counts for accurate badges
  const counts = useMemo(() => {
    let active = 0;
    let suspended = 0;
    let pending = 0;
    let notCompleted = 0;

    students.forEach((st) => {
      if (st.status === 'ACTIVE' || st.status === 'VERIFIED') active++;
      else if (st.status === 'SUSPENDED') suspended++;
      else if (st.status === 'PENDING') pending++;
      else notCompleted++;
    });

    return {
      ALL: students.length,
      ACTIVE: active,
      SUSPENDED: suspended,
      PENDING: pending,
      NOT_COMPLETED: notCompleted,
    };
  }, [students]);

  // Academic Diagnostic modal
  const [diagnosticStudent, setDiagnosticStudent] = useState<any | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);

  // Student Full Profile modal
  const [profileStudent, setProfileStudent] = useState<any | null>(null);

  // Manual Add Student modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Status update message
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getStudents();
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const handleOpenDiagnostic = async (st: any) => {
    setDiagnosticStudent(st);
    try {
      setDiagnosticLoading(true);
      const res = await teacherApi.getStudentDiagnostic(st.student_id);
      if (res.success) {
        setAttempts(res.attempts || []);
      }
    } catch (err) {
      console.error('Error fetching student diagnostic:', err);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleToggleStatus = async (st: any) => {
    const isSuspending = st.status !== 'SUSPENDED';
    const actionText = isSuspending ? 'suspend' : 'reactivate';
    const targetStatus = isSuspending ? 'SUSPENDED' : 'ACTIVE';

    const confirmMsg = `Are you sure you want to ${actionText} student "${st.full_name}" (${st.email})?\n\n${
      isSuspending
        ? 'This will immediately revoke their ability to take mock tests.'
        : 'This will restore their active portal and examination access.'
    }`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await teacherApi.updateStudentStatus(st.student_id, targetStatus);
      setActionMessage(res.message || `Student status updated to ${targetStatus}.`);
      await loadStudents();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to ${actionText} student: ${err.message}`);
    }
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!manualName.trim() || !manualEmail.trim()) {
      setAddError('Please provide both student full name and email.');
      return;
    }

    try {
      setAddLoading(true);
      const res = await teacherApi.manualAddStudent({
        fullName: manualName.trim(),
        email: manualEmail.trim(),
      });

      if (res.success) {
        setCreatedCredentials(res.credentials);
        setManualName('');
        setManualEmail('');
        await loadStudents();
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to add student.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Student: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filter students by search and status
  const filteredStudents = students.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      st.full_name?.toLowerCase().includes(q) ||
      st.email?.toLowerCase().includes(q) ||
      st.admission_no?.toLowerCase().includes(q) ||
      st.phone_no?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && (st.status === 'ACTIVE' || st.status === 'VERIFIED')) ||
      st.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'VERIFIED':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger" size="sm">Suspended</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      default:
        return <Badge variant="default" size="sm">Setup Incomplete</Badge>;
    }
  };

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={getTeacherNavItems()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header with Title & Add Student CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
              Class 12 Student Directory
            </h1>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              Manage student enrollments, inspect diagnostic test reports, and provision candidates for {user?.schoolName || 'your institution'}.
            </p>
          </div>
          <Button
            variant="gold"
            icon={<UserPlus size={16} />}
            onClick={() => {
              setCreatedCredentials(null);
              setAddError(null);
              setShowAddModal(true);
            }}
          >
            Add Student Manually
          </Button>
        </div>

        {/* Action Feedback Banner */}
        {actionMessage && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Search & Status Filters */}
        <Card variant="glass" padding="md">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search students by name, email, admission no, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'NOT_COMPLETED'] as const).map((filter) => {
                const labelMap: Record<string, string> = {
                  ALL: `All (${counts.ALL})`,
                  ACTIVE: `Active (${counts.ACTIVE})`,
                  PENDING: `Pending (${counts.PENDING})`,
                  SUSPENDED: `Suspended (${counts.SUSPENDED})`,
                  NOT_COMPLETED: `Setup Incomplete (${counts.NOT_COMPLETED})`,
                };
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: statusFilter === filter ? '#0F172A' : '#F1F5F9',
                      color: statusFilter === filter ? '#FFFFFF' : '#475569',
                      border: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {labelMap[filter]}
                  </button>
                );
              })}

              {/* Grid / List View Toggle */}
              <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid #CBD5E1', overflow: 'hidden', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'grid' ? '#0F172A' : '#FFFFFF',
                    color: viewMode === 'grid' ? '#FFFFFF' : '#64748B',
                    border: 'none',
                  }}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'list' ? '#0F172A' : '#FFFFFF',
                    color: viewMode === 'list' ? '#FFFFFF' : '#64748B',
                    border: 'none',
                  }}
                >
                  <List size={14} /> List
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Students Display (Grid or Compact List) */}
        {loading ? (
          <LoadingSpinner message="Querying student records..." />
        ) : filteredStudents.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <GraduationCap size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Matching Students Found</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              {searchQuery ? 'Try clearing your search terms or filters.' : 'Use "+ Add Student Manually" or the CSV Upload tab to enroll students.'}
            </p>
          </Card>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredStudents.map((st) => (
              <Card key={st.student_id} variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>{st.full_name}</h4>
                    {getStatusBadge(st.status)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                    Admission No: <strong>{st.admission_no || 'Pending Setup'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>
                    Email: {st.email}
                  </div>
                  {st.phone_no && (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Phone: {st.phone_no}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Info size={14} />}
                      onClick={() => setProfileStudent(st)}
                    >
                      Full Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<BarChart2 size={14} />}
                      onClick={() => handleOpenDiagnostic(st)}
                    >
                      Diagnostic
                    </Button>
                  </div>

                  <Button
                    variant={st.status === 'SUSPENDED' ? 'secondary' : 'danger'}
                    size="sm"
                    icon={st.status === 'SUSPENDED' ? <RotateCcw size={14} /> : <Ban size={14} />}
                    onClick={() => handleToggleStatus(st)}
                    style={{ width: '100%' }}
                  >
                    {st.status === 'SUSPENDED' ? 'Reactivate Student' : 'Suspend Student'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Compact Table List View */
          <Card variant="glass" padding="none" style={{ overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Student Candidate</th>
                  <th style={{ padding: '12px 16px' }}>Admission / APAAR</th>
                  <th style={{ padding: '12px 16px' }}>Email & Phone</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => (
                  <tr key={st.student_id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {st.profile_photo_url ? (
                          <img
                            src={st.profile_photo_url}
                            alt={st.full_name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                            {(st.full_name || 'S').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <strong style={{ color: '#0F172A', display: 'block' }}>{st.full_name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>Class 12</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      <div>{st.admission_no || '—'}</div>
                      {st.apaar && <div style={{ fontSize: '11px', color: '#64748B' }}>APAAR: {st.apaar}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <div>{st.email}</div>
                      {st.phone_no && <div style={{ fontSize: '11px', color: '#64748B' }}>{st.phone_no}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(st.status)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          icon={<Info size={13} />}
                          onClick={() => setProfileStudent(st)}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          icon={<BarChart2 size={13} />}
                          onClick={() => handleOpenDiagnostic(st)}
                        >
                          Diagnostic
                        </Button>
                        <Button
                          variant={st.status === 'SUSPENDED' ? 'secondary' : 'danger'}
                          size="sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          icon={st.status === 'SUSPENDED' ? <RotateCcw size={13} /> : <Ban size={13} />}
                          onClick={() => handleToggleStatus(st)}
                        >
                          {st.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* 1. Modal: Add Student Manually */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Student Manually" maxWidth="520px">
          {!createdCredentials ? (
            <form onSubmit={handleManualAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#475569' }}>
                Enroll a Class 12 student. A temporary password following <code>{'${studentFirstName}@${schoolCode}'}</code> will be generated for their first login.
              </p>

              {addError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '13px' }}>
                  {addError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Student Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Student Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="e.g. aarav.sharma@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="gold" type="submit" loading={addLoading}>
                  Enroll Candidate
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} />
                <span>Student account created successfully!</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13px', color: '#475569' }}>Name: <strong style={{ color: '#0F172A' }}>{createdCredentials.name}</strong></div>
                <div style={{ fontSize: '13px', color: '#475569' }}>Email: <strong style={{ color: '#0F172A' }}>{createdCredentials.email}</strong></div>
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  Temporary Formula Password: <strong style={{ color: '#9A751A', fontFamily: 'monospace', fontSize: '14px' }}>{createdCredentials.temporaryPassword}</strong>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Share these credentials with the student. On their first login, they will be prompted to set their permanent password and complete profile verification.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <Button variant="secondary" icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={handleCopyCredentials}>
                  {copied ? 'Copied Credentials!' : 'Copy Credentials'}
                </Button>
                <Button variant="gold" onClick={() => setShowAddModal(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* 2. Modal: Full Student Profile Details */}
        <Modal isOpen={!!profileStudent} onClose={() => setProfileStudent(null)} title="Student Profile & Enrollment Status" maxWidth="560px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px 16px', borderRadius: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{profileStudent?.full_name}</h3>
                <div style={{ fontSize: '13px', color: '#64748B' }}>{profileStudent?.email}</div>
              </div>
              {profileStudent && getStatusBadge(profileStudent.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div><span style={{ color: '#64748B' }}>Admission No:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{profileStudent?.admission_no || 'Not Set'}</div></div>
              <div><span style={{ color: '#64748B' }}>APAAR ID:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{profileStudent?.apaar || 'Not Set'}</div></div>
              <div><span style={{ color: '#64748B' }}>Contact Phone:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{profileStudent?.phone_no || 'Not Set'}</div></div>
              <div><span style={{ color: '#64748B' }}>Date of Birth:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{profileStudent?.dob ? new Date(profileStudent.dob).toLocaleDateString() : 'Not Set'}</div></div>
              <div><span style={{ color: '#64748B' }}>Gender:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{profileStudent?.gender || 'Not Set'}</div></div>
              <div><span style={{ color: '#64748B' }}>Class Cohort:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>Class 12</div></div>
              <div><span style={{ color: '#64748B' }}>Enrolled Date:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{profileStudent?.created_at ? new Date(profileStudent.created_at).toLocaleDateString() : 'N/A'}</div></div>
              <div><span style={{ color: '#64748B' }}>Institution:</span> <div style={{ fontWeight: 700, color: '#0F172A' }}>{user?.schoolName || 'Affiliated School'}</div></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setProfileStudent(null)}>Close</Button>
            </div>
          </div>
        </Modal>

        {/* 3. Modal: Academic Diagnostic */}
        <Modal isOpen={!!diagnosticStudent} onClose={() => setDiagnosticStudent(null)} title={`Performance Diagnostic: ${diagnosticStudent?.full_name}`} maxWidth="640px">
          {diagnosticLoading ? (
            <LoadingSpinner message="Loading student test history..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>Admission No: <strong>{diagnosticStudent?.admission_no || 'N/A'}</strong></div>
                <div>Tests Attempted: <strong style={{ color: '#059669' }}>{attempts.length}</strong></div>
              </div>

              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>Completed Mock Tests</h4>
                {attempts.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '14px', fontStyle: 'italic' }}>Student has not attempted any mock tests yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {attempts.map((att) => (
                      <div key={att.attempt_id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{att.mock_test?.title || 'Mock Test'}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Attempted: {new Date(att.submitted_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: att.percentage >= 75 ? '#059669' : '#9A751A' }}>{att.percentage}%</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{att.correct_ans} Correct / {att.wrong_ans} Wrong</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
