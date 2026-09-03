import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { GraduationCap, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export const StudentRegister: React.FC = () => {
  const navigate = useNavigate();
  const { registerStudentInit } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all 3 fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextStep = await registerStudentInit({
        full_name: fullName,
        email,
        password,
      });
      navigate(nextStep);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
      <div className="gradient-blob-2" style={{ top: '15%', right: '25%' }} />

      <Card
        variant="glass"
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <GraduationCap size={26} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Student Registration
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Step 1 of 2: Create your personal assessment account
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ECFDF5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #A7F3D0', marginBottom: '20px' }}>
          <Sparkles size={18} style={{ color: '#059669', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
            After entering your basic details, you will select your verified school from our official directory and enter your student identification.
          </p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            placeholder="Aarav Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User size={18} />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="aarav.class12@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <Input
            label="Create Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            helperText="Minimum 6 characters."
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Continue to School Selection
          </Button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '13px', color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0284C7', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};
