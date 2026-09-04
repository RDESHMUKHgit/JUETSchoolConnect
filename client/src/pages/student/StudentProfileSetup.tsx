import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { schoolApi } from '../../api/school.api.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { School, GraduationCap, ArrowRight, Lock, Key, Sparkles, CheckCircle2 } from 'lucide-react';

export const StudentProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeStudentProfile } = useAuth();

  const [verifiedSchools, setVerifiedSchools] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(user?.schoolId || '');
  
  // Password Setup Fields (One-time only!)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Personal Details
  const [phoneNo, setPhoneNo] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [apaar, setApaar] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');

  const [loading, setLoading] = useState(false);
  const [fetchingSchools, setFetchingSchools] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.schoolId) {
      async function loadSchools() {
        try {
          setFetchingSchools(true);
          const res = await schoolApi.getVerifiedSchools();
          if (res.success && res.schools) {
            setVerifiedSchools(
              res.schools.map((s: any) => ({
                value: s.school_id,
                label: `${s.name} (${s.city}, ${s.state})`,
              }))
            );
          }
        } catch (err) {
          console.error('Error fetching schools:', err);
        } finally {
          setFetchingSchools(false);
        }
      }
      loadSchools();
    }
  }, [user?.schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const schoolIdToUse = user?.schoolId || selectedSchoolId;
    if (!schoolIdToUse) {
      setError('Please select your school from the verified list.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      const nextStep = await completeStudentProfile({
        school_id: schoolIdToUse,
        phone_no: phoneNo,
        admission_no: admissionNo,
        apaar: apaar || null,
        dob: dob || null,
        gender,
        new_password: newPassword || undefined,
        current_password: currentPassword || undefined,
      });
      navigate(nextStep);
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card
        variant="glass"
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Set Password & Complete Profile
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Complete your enrollment details. Your profile will be submitted to your teacher for activation.
          </p>
        </div>

        {/* School & Student Context */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Enrolled Student</div>
            <strong style={{ color: '#0F172A', fontSize: '14px' }}>{user?.fullName || user?.email}</strong>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Institution</div>
            <strong style={{ color: '#9A751A', fontSize: '14px' }}>{user?.schoolName || 'Linked School'}</strong>
          </div>
          <Badge variant="gold" size="sm">Class 12</Badge>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '13px',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. One-time Password Setup Section */}
          <div
            style={{
              background: 'linear-gradient(145deg, #FFFBEB 0%, #FFFFFF 100%)',
              border: '1px solid #FDE68A',
              padding: '18px',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Key size={18} style={{ color: '#D97706' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#92400E', margin: 0 }}>
                Set Your Permanent Password (One-Time Setup)
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#B45309', marginBottom: '14px' }}>
              Replace your temporary onboarding password with your own secure personal password.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label="Temporary Password (Optional if already logged in)"
                type="password"
                placeholder="Enter current temporary password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="New Permanent Password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm Permanent Password"
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* School Selector if not pre-linked */}
          {!user?.schoolId && (
            <Select
              label="Select Your Accredited High School"
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              options={verifiedSchools}
              placeholder={fetchingSchools ? 'Loading accredited schools...' : 'Choose your school'}
              required
            />
          )}

          {/* 2. Personal & Academic Details */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
              Academic & Contact Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Input
                label="Admission / Roll Number"
                placeholder="e.g. 12B-042"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                required
              />
              <Input
                label="APAAR / Automated Student ID"
                placeholder="12-digit APAAR ID"
                value={apaar}
                onChange={(e) => setApaar(e.target.value)}
                helperText="Optional government student ID"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Input
                label="Contact Phone / WhatsApp"
                placeholder="+91 98765 43210"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Submit for Teacher Verification
          </Button>
        </form>
      </Card>
    </div>
  );
};
