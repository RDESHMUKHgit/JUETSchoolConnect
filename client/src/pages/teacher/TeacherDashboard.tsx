import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { getTeacherNavItems } from '../../utils/navigation.js';
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
  Edit,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [empId, setEmpId] = useState(user?.teachers_emp_id || '');
  const [department, setDepartment] = useState(user?.department || 'Science');
  const [specialization, setSpecialization] = useState(user?.specialization || 'Physics');
  const [qualification, setQualification] = useState(user?.qualification || 'M.Sc., B.Ed.');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmpId(user.teachers_emp_id || '');
      setDepartment(user.department || 'Science');
      setSpecialization(user.specialization || 'Physics');
      setQualification(user.qualification || 'M.Sc., B.Ed.');
      setGender(user.gender || 'MALE');
    }
  }, [user, isEditProfileOpen]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileErr(null);
      setProfileMsg(null);
      const res = await teacherApi.completeProfile({
        full_name: fullName,
        phone,
        teachers_emp_id: empId,
        department,
        specialization,
        qualification,
        gender,
      });
      if (res.success) {
        await refreshUser();
        setProfileMsg('Profile information updated successfully!');
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setProfileMsg(null);
        }, 1000);
      }
    } catch (err: any) {
      setProfileErr(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

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

  const navItems = getTeacherNavItems(pendingStudents.length);

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
            {/* Faculty Profile Summary Card */}
            <Card variant="glass" padding="md" style={{ borderLeft: '4px solid #0284C7', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F0F9FF', border: '2px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', fontWeight: 800, fontSize: '22px' }}>
                    {(user?.fullName || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {user?.fullName || 'Faculty Member'}
                      </h2>
                      <Badge variant="info">{user?.designation || 'Teacher'}</Badge>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#475569' }}>
                      {user?.department ? `${user.department} • ` : ''}{user?.schoolName || 'School'}
                    </p>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} /> {user?.email}
                      </span>
                      {user?.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} /> {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit size={14} />}
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </Card>

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

      {/* Update Faculty Information Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => {
          setIsEditProfileOpen(false);
          setProfileErr(null);
          setProfileMsg(null);
        }}
        title="Update Faculty Profile Information"
        maxWidth="560px"
      >
        {profileMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{profileMsg}</span>
          </div>
        )}

        {profileErr && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{profileErr}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name *"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Contact Phone Number *"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Teacher / Employee ID"
              type="text"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              placeholder="e.g. EMP-2026-042"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Academic Department *"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'Science', label: 'Science / PCM' },
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Commerce', label: 'Commerce' },
                { value: 'Humanities', label: 'Humanities' },
              ]}
              required
            />
            <Select
              label="Gender *"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Specialization / Subject Area"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Organic Chemistry, Calculus"
            />
            <Input
              label="Highest Qualification"
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. M.Sc., B.Ed., Ph.D."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsEditProfileOpen(false)}
              disabled={savingProfile}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              icon={<Save size={16} />}
              loading={savingProfile}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </PortalSidebarLayout>
  );
};
