import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { BookOpen, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const TeacherProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeTeacherProfile } = useAuth();

  // Teacher profile setup state (Full Name is pre-set by the Principal during account provisioning)
  const [phone, setPhone] = useState(user?.phone || '');
  const [empId, setEmpId] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Science');
  const [specialization, setSpecialization] = useState('Physics');
  const [qualification, setQualification] = useState('M.Sc., B.Ed.');
  const [gender, setGender] = useState('MALE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const nextStep = await completeTeacherProfile({
        phone,
        teachers_emp_id: empId,
        department,
        specialization,
        qualification,
        gender,
      });
      if (user?.status === 'VERIFIED' || user?.status === 'ACTIVE') {
        navigate('/teacher');
      } else {
        navigate(nextStep);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card variant="glass" padding="lg" style={{ width: '100%', maxWidth: '540px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0284C7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <BookOpen size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Faculty Profile Setup
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Complete your teacher details for school principal verification
          </p>
        </div>

        {/* Pre-filled Account Information from Principal */}
        <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: '#9A751A' }} />
            <p style={{ fontSize: '14px', color: '#0F172A', margin: 0, fontWeight: 700 }}>
              {user?.fullName || 'Faculty Member'}
            </p>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Official Email: <strong style={{ color: '#0F172A' }}>{user?.email}</strong>
          </p>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Associated School: <strong style={{ color: '#0F172A' }}>{user?.schoolName || 'Your School'}</strong>
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Contact Phone"
              placeholder="+91 98111 22233"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone size={18} />}
            />
            <Input
              label="Employee ID (Optional)"
              placeholder="EMP-1042"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'Science', label: 'Department of Science' },
                { value: 'Mathematics', label: 'Department of Mathematics' },
                { value: 'Computer Science', label: 'Computer Science & IT' },
              ]}
            />
            <Select
              label="Subject Specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              options={[
                { value: 'Physics', label: 'Class 12 Physics' },
                { value: 'Chemistry', label: 'Class 12 Chemistry' },
                { value: 'Mathematics', label: 'Class 12 Mathematics' },
                { value: 'Computer Science', label: 'Class 12 Computer Science' },
              ]}
            />
          </div>

          <Input
            label="Highest Academic Qualification"
            placeholder="M.Sc. in Physics, B.Ed."
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Submit for Principal Verification
          </Button>
        </form>
      </Card>
    </div>
  );
};
