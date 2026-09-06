import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { GraduationCap, BookOpen, School, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Strictly 3 roles: Student, Teacher, Principal. NO ADMIN!
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const redirectUrl = await login(email, password, selectedRole);
      if (redirectUrl.includes('profile-setup')) {
        sessionStorage.setItem('temp_login_pass', password);
      }
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleHelpText = () => {
    switch (selectedRole) {
      case 'STUDENT':
        return 'Class 12 students log in using the email registered on the portal.';
      case 'TEACHER':
        return 'Teachers log in using credentials provisioned by your School Principal.';
      case 'PRINCIPAL':
        return 'School Administrators log in using your registered principal account.';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        position: 'relative',
      }}
    >
      <div className="gradient-blob-1" style={{ top: '10%', left: '30%' }} />

      <Card
        variant="glass"
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #E5B842 0%, #C59B27 100%)',
              color: '#0F172A',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)',
            }}
          >
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Portal Sign In
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Select your academic role to proceed to your cockpit
          </p>
        </div>

        {/* Strictly 3-role selector tab */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            backgroundColor: '#F1F5F9',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => { setSelectedRole('STUDENT'); setError(null); }}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              color: selectedRole === 'STUDENT' ? '#0F172A' : '#475569',
              background: selectedRole === 'STUDENT' ? '#FFFFFF' : 'transparent',
              boxShadow: selectedRole === 'STUDENT' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <GraduationCap size={18} style={{ color: selectedRole === 'STUDENT' ? '#059669' : 'inherit' }} />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('TEACHER'); setError(null); }}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              color: selectedRole === 'TEACHER' ? '#0F172A' : '#475569',
              background: selectedRole === 'TEACHER' ? '#FFFFFF' : 'transparent',
              boxShadow: selectedRole === 'TEACHER' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <BookOpen size={18} style={{ color: selectedRole === 'TEACHER' ? '#0284C7' : 'inherit' }} />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('PRINCIPAL'); setError(null); }}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              color: selectedRole === 'PRINCIPAL' ? '#0F172A' : '#475569',
              background: selectedRole === 'PRINCIPAL' ? '#FFFFFF' : 'transparent',
              boxShadow: selectedRole === 'PRINCIPAL' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <School size={18} style={{ color: selectedRole === 'PRINCIPAL' ? '#9A751A' : 'inherit' }} />
            <span>Principal</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEFCE8', border: '1px solid #FEF08A', marginBottom: '20px' }}>
          <ShieldCheck size={16} style={{ color: '#9A751A', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#334155' }}>{getRoleHelpText()}</span>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input
            label="Email Address"
            type="email"
            placeholder={
              selectedRole === 'STUDENT'
                ? 'student@example.com'
                : selectedRole === 'TEACHER'
                ? 'teacher@school.edu.in'
                : 'principal@school.edu.in'
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '6px' }}
          >
            Sign In as {selectedRole === 'PRINCIPAL' ? 'School Administrator' : selectedRole}
          </Button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '13px', color: '#475569' }}>
          {selectedRole === 'STUDENT' ? (
            <span>
              New Class 12 student?{' '}
              <Link to="/register-student" style={{ color: '#9A751A', fontWeight: 600 }}>
                Register here
              </Link>
            </span>
          ) : selectedRole === 'PRINCIPAL' ? (
            <span>
              Need to register your school?{' '}
              <Link to="/register-school" style={{ color: '#9A751A', fontWeight: 600 }}>
                Register School
              </Link>
            </span>
          ) : (
            <span>
              Teacher accounts are provisioned directly by your School Principal.
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
