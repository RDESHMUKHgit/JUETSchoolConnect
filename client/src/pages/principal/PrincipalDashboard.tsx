import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { principalApi } from '../../api/principal.api.js';
import { schoolApi } from '../../api/school.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { getPrincipalNavItems } from '../../utils/navigation.js';
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
  Edit,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  MapPin,
} from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { user, refreshUser, completePrincipalProfile } = useAuth();
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

  // Edit Profile / Update Information Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [principalPhone, setPrincipalPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState<'P' | 'VP'>((user?.designation as any) || 'P');
  const [officialPhone, setOfficialPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pin, setPin] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  // Load institutional profile
  useEffect(() => {
    async function loadSchoolData() {
      try {
        if (user?.schoolId) {
          const sRes = await schoolApi.getSchoolProfile(user.schoolId);
          if (sRes.success && sRes.school) {
            setOfficialPhone(sRes.school.official_phone || '');
            setContactEmail(sRes.school.contact_email || '');
            setWebsiteUrl(sRes.school.website_url || '');
            setPin(sRes.school.pin || '');
          }
        }
      } catch (err) {
        console.error('Error fetching school profile:', err);
      }
    }
    loadSchoolData();
  }, [user?.schoolId]);

  // Sync state when user or modal changes
  useEffect(() => {
    if (user) {
      setPrincipalPhone(user.phone || '');
      if (user.designation) setDesignation(user.designation as any);
    }
  }, [user, isEditProfileOpen]);

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

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileErr(null);
      setProfileMsg(null);

      // 1. Update Principal personal profile
      await completePrincipalProfile({
        phone: principalPhone,
        gender: 'MALE',
        designation,
      });

      // 2. Update School institutional details
      if (user?.schoolId) {
        await schoolApi.updateSchoolProfile({
          official_phone: officialPhone,
          contact_email: contactEmail,
          website_url: websiteUrl,
          pin,
        });
      }

      await refreshUser();
      setProfileMsg('Institutional & Principal profile updated successfully!');
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setProfileMsg(null);
      }, 1000);
    } catch (err: any) {
      setProfileErr(err.message || 'Failed to update institutional information.');
    } finally {
      setProfileSaving(false);
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

  const navItems = getPrincipalNavItems();

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
            {/* Principal & School Institutional Profile Card */}
            <Card variant="glass" padding="md" style={{ borderLeft: '4px solid #C59B27', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEFCE8', border: '2px solid #FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A751A', fontWeight: 800, fontSize: '22px' }}>
                    {(user?.fullName || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {user?.fullName || 'School Principal'}
                      </h2>
                      <Badge variant="gold">{user?.designation === 'VP' ? 'Vice Principal' : 'Principal'}</Badge>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#475569' }}>
                      {user?.schoolName || 'Institution'} • Accredited School Connect Member
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
                  Accredited School Connect Institution
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

      {/* Update School & Principal Information Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => {
          setIsEditProfileOpen(false);
          setProfileErr(null);
          setProfileMsg(null);
        }}
        title="Update School & Principal Information"
        maxWidth="580px"
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

        <form onSubmit={handleUpdateProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Principal Phone Number *"
              type="tel"
              value={principalPhone}
              onChange={(e) => setPrincipalPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              required
            />
            <Select
              label="Designation *"
              value={designation}
              onChange={(e) => setDesignation(e.target.value as any)}
              options={[
                { value: 'P', label: 'Principal' },
                { value: 'VP', label: 'Vice Principal' },
              ]}
              required
            />
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginTop: '4px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
              Institutional Contact Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="School Official Phone"
                type="tel"
                value={officialPhone}
                onChange={(e) => setOfficialPhone(e.target.value)}
                placeholder="e.g. 0120-2400973"
                icon={<Phone size={14} />}
              />
              <Input
                label="School Official Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. principal@school.edu.in"
                icon={<Mail size={14} />}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Official Website URL"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. https://www.dpsschool.edu.in"
                icon={<Globe size={14} />}
              />
              <Input
                label="Postal PIN Code"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. 201304"
                icon={<MapPin size={14} />}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsEditProfileOpen(false)}
              disabled={profileSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              icon={<Save size={16} />}
              loading={profileSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

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
            placeholder="e.g. Dr. Priya Sharma"
            value={teacherFullName}
            onChange={(e) => setTeacherFullName(e.target.value)}
            icon={<User size={16} />}
            helperText="The teacher's official name on faculty records."
            required
          />

          <Input
            label="Teacher Email Address"
            type="email"
            placeholder="e.g. priya.sharma@school.edu.in"
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
