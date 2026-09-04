import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { schoolApi } from '../../api/school.api.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ImageUpload } from '../../components/ui/ImageUpload.js';
import {
  School,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Phone,
  Calendar,
  IdCard,
  User,
  Camera,
  Send,
} from 'lucide-react';

export const StudentProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeStudentProfile } = useAuth();

  // 5-Step Stepper State
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: School
  const [verifiedSchools, setVerifiedSchools] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(user?.schoolId || '');
  const [fetchingSchools, setFetchingSchools] = useState<boolean>(false);

  // Step 2: Teacher from selected school
  const [teachers, setTeachers] = useState<Array<{ teacher_id: string; full_name: string; designation?: string; department?: string }>>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [fetchingTeachers, setFetchingTeachers] = useState<boolean>(false);

  // Step 3: Student Credentials & Info
  const [phoneNo, setPhoneNo] = useState<string>(user?.phone_no || user?.phone || '');
  const [admissionNo, setAdmissionNo] = useState<string>(user?.admission_no || '');
  const [apaar, setApaar] = useState<string>(user?.apaar || '');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<string>('MALE');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Step 4: Profile Picture
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(user?.profile_photo_url || '');

  // Status & Error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch verified schools
  useEffect(() => {
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
  }, []);

  // Fetch teachers whenever school is selected
  useEffect(() => {
    const schoolIdToUse = selectedSchoolId || user?.schoolId;
    if (schoolIdToUse) {
      async function loadTeachers() {
        try {
          setFetchingTeachers(true);
          const res = await schoolApi.getTeachersBySchool(schoolIdToUse as string);
          if (res.success && res.teachers) {
            setTeachers(res.teachers);
            if (res.teachers.length > 0 && !selectedTeacherId) {
              setSelectedTeacherId(res.teachers[0].teacher_id);
            }
          }
        } catch (err) {
          console.error('Error fetching teachers for school:', err);
        } finally {
          setFetchingTeachers(false);
        }
      }
      loadTeachers();
    }
  }, [selectedSchoolId, user?.schoolId]);

  // Validate step progression
  const handleNextStep = () => {
    setError(null);

    if (currentStep === 1) {
      const schoolIdToUse = user?.schoolId || selectedSchoolId;
      if (!schoolIdToUse) {
        setError('Please select your affiliated institution to proceed.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Teacher assignment is optional or recommended if available
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!admissionNo.trim()) {
        setError('Please provide your official Class 12 Admission / Roll number.');
        return;
      }
      if (!phoneNo.trim()) {
        setError('Please provide your contact mobile number.');
        return;
      }
      if (newPassword) {
        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const schoolIdToUse = user?.schoolId || selectedSchoolId;
    if (!schoolIdToUse) {
      setError('Please select your affiliated school.');
      setCurrentStep(1);
      return;
    }

    try {
      setLoading(true);
      const nextStep = await completeStudentProfile({
        school_id: schoolIdToUse,
        teacher_id: selectedTeacherId || undefined,
        phone_no: phoneNo,
        admission_no: admissionNo,
        apaar: apaar || null,
        dob: dob || null,
        gender,
        new_password: newPassword || undefined,
        current_password: currentPassword || undefined,
        profile_photo_url: profilePhotoUrl || undefined,
      });
      if (user?.status === 'VERIFIED' || user?.status === 'ACTIVE') {
        navigate('/student');
      } else {
        navigate(nextStep);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit profile for verification.');
    } finally {
      setLoading(false);
    }
  };

  const stepsMeta = [
    { step: 1, title: 'School Selection' },
    { step: 2, title: 'Teacher Mentor' },
    { step: 3, title: 'Student Info' },
    { step: 4, title: 'Profile Photo' },
    { step: 5, title: 'Review & Submit' },
  ];

  const selectedSchoolObj = verifiedSchools.find((s) => s.value === (selectedSchoolId || user?.schoolId));
  const selectedTeacherObj = teachers.find((t) => t.teacher_id === selectedTeacherId);

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card
        variant="glass"
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Wizard Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            }}
          >
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Candidate Onboarding
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Step {currentStep} of 5: {stepsMeta[currentStep - 1]?.title}
          </p>
        </div>

        {/* 5-Step Stepper Dots Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {stepsMeta.map((s) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: s.step < currentStep ? 'pointer' : 'default',
                  backgroundColor: s.step === currentStep ? '#0F172A' : s.step < currentStep ? '#10B981' : '#F1F5F9',
                  color: s.step <= currentStep ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.step < currentStep ? '✓' : s.step}
              </div>
              {s.step < 5 && (
                <div
                  style={{
                    width: '28px',
                    height: '2px',
                    backgroundColor: s.step < currentStep ? '#10B981' : '#E2E8F0',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: School Selection */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                <School size={18} style={{ color: '#059669' }} />
                <span>Affiliated Institution</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>
                Select the school where you are actively registered for Class 12 CBSE / ICSE examinations.
              </p>
            </div>

            {user?.schoolId ? (
              <div style={{ padding: '14px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <span style={{ fontSize: '12px', color: '#065F46', fontWeight: 600 }}>Enrolled Institution:</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                  {user.schoolName || 'Your School'}
                </div>
              </div>
            ) : fetchingSchools ? (
              <p style={{ fontSize: '13px', color: '#64748B' }}>Loading registered schools directory...</p>
            ) : (
              <Select
                label="Select Verified School *"
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                options={[{ value: '', label: '-- Select Your School --' }, ...verifiedSchools]}
              />
            )}

            <Button
              variant="gold"
              size="lg"
              icon={<ArrowRight size={18} />}
              onClick={handleNextStep}
              style={{ marginTop: '8px' }}
            >
              Continue to Teacher Assignment
            </Button>
          </div>
        )}

        {/* STEP 2: Teacher Selection */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                <UserCheck size={18} style={{ color: '#2563EB' }} />
                <span>Faculty Verifier / Mentor</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>
                Choose the verified faculty member at your school who will review and verify your candidate account.
              </p>
            </div>

            {fetchingTeachers ? (
              <p style={{ fontSize: '13px', color: '#64748B' }}>Fetching verified teachers for this school...</p>
            ) : teachers.length === 0 ? (
              <div style={{ padding: '14px', borderRadius: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E' }}>
                No active faculty members found yet for this school. Your principal will review your submission directly.
              </div>
            ) : (
              <Select
                label="Assigned Verifying Teacher *"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                options={teachers.map((t) => ({
                  value: t.teacher_id,
                  label: `${t.full_name} (${t.designation || 'Teacher'} - ${t.department || 'Science'})`,
                }))}
              />
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Button variant="secondary" size="lg" icon={<ArrowLeft size={16} />} onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button variant="gold" size="lg" icon={<ArrowRight size={16} />} onClick={handleNextStep} style={{ flex: 1 }}>
                Continue to Student Info
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Student Details & Password */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Admission / Roll Number *"
                placeholder="e.g. ADM-2026-4412"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                required
              />
              <Input
                label="APAAR ID (Optional)"
                placeholder="12-digit APAAR ID"
                value={apaar}
                onChange={(e) => setApaar(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Contact Phone *"
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

            {/* Optional Password Update if temporary password was used */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                Set Permanent Password (Optional)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" size="lg" icon={<ArrowLeft size={16} />} onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button variant="gold" size="lg" icon={<ArrowRight size={16} />} onClick={handleNextStep} style={{ flex: 1 }}>
                Continue to Profile Photo
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Profile Photograph */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                <Camera size={18} style={{ color: '#0284C7' }} />
                <span>Candidate Photograph</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>
                Upload a clear frontal passport-style photo for examination cockpit identification (Max 300 KB).
              </p>
            </div>

            <ImageUpload
              bucket="profile-images"
              value={profilePhotoUrl}
              onChange={setProfilePhotoUrl}
              label="Student Profile Picture (Max 300 KB)"
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" size="lg" icon={<ArrowLeft size={16} />} onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button variant="gold" size="lg" icon={<ArrowRight size={16} />} onClick={handleNextStep} style={{ flex: 1 }}>
                Continue to Review & Submit
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmitFinal} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#ECFDF5', padding: '14px 16px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', fontWeight: 700, fontSize: '14px' }}>
                <CheckCircle2 size={18} />
                <span>Candidate Enrollment Summary</span>
              </div>
              <p style={{ fontSize: '12px', color: '#065F46', marginTop: '4px', margin: 0 }}>
                Review your profile details. Upon submission, your record is sent to your teacher for verification.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Candidate Photo"
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#64748B' }}>
                  {(user?.fullName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {user?.fullName || 'Student'}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0' }}>
                  Class 12 • {admissionNo}
                </p>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {user?.email}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                  School:
                </span>
                <strong style={{ color: '#0F172A' }}>{selectedSchoolObj?.label || user?.schoolName || 'School'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Verifying Faculty:
                </span>
                <strong style={{ color: '#0F172A' }}>{selectedTeacherObj ? selectedTeacherObj.full_name : 'School Principal Direct'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Contact Phone:
                </span>
                <strong style={{ color: '#0F172A' }}>{phoneNo}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                  APAAR ID:
                </span>
                <strong style={{ color: '#0F172A' }}>{apaar || 'N/A'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" size="lg" icon={<ArrowLeft size={16} />} onClick={() => setCurrentStep(4)}>
                Back
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="lg"
                loading={loading}
                icon={<Send size={16} />}
                style={{ flex: 1 }}
              >
                Submit to Teacher for Verification
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
