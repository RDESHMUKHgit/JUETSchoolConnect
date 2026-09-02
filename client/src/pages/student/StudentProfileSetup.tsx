import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { schoolApi } from '../../api/school.api.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { School, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export const StudentProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeStudentProfile } = useAuth();

  const [verifiedSchools, setVerifiedSchools] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [apaar, setApaar] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');

  const [loading, setLoading] = useState(false);
  const [fetchingSchools, setFetchingSchools] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      setError('Please select your verified school from the list.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextStep = await completeStudentProfile({
        school_id: selectedSchoolId,
        phone_no: phoneNo,
        admission_no: admissionNo,
        apaar: apaar || null,
        dob: dob || null,
        gender,
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
      <Card variant="glass" padding="lg" style={{ width: '100%', maxWidth: '580px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            School Selection & Academic Profile
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Step 2 of 2: Link your account to your accredited high school
          </p>
        </div>

        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
            Student: <strong style={{ color: '#0F172A' }}>{user?.fullName || user?.email}</strong> | Class: <strong style={{ color: '#059669' }}>12th Grade</strong>
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Only schools currently in our DB */}
          <Select
            label="Select Your Verified High School"
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            options={verifiedSchools}
            placeholder={fetchingSchools ? 'Loading verified schools from database...' : 'Choose your school'}
            required
          />

          {verifiedSchools.length === 0 && !fetchingSchools && (
            <p style={{ fontSize: '12px', color: '#F59E0B' }}>
              No verified schools found in the database yet. Ask your school principal to register your school first!
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Contact Phone / WhatsApp"
              placeholder="+91 98765 43210"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Submit for School Approval
          </Button>
        </form>
      </Card>
    </div>
  );
};
