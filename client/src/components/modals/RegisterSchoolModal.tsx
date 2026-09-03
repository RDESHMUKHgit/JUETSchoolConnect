import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface RegisterSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterSchoolModal: React.FC<RegisterSchoolModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { registerPrincipalInit } = useAuth();

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
      const nextStep = await registerPrincipalInit({
        full_name: fullName,
        email,
        password,
      });
      onClose();
      navigate(nextStep);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Your School" maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEFCE8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FEF08A' }}>
          <ShieldCheck size={22} style={{ color: '#9A751A', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
            <strong style={{ color: '#9A751A' }}>Step 1 of 3:</strong> Begin by creating your Principal Administrator credentials. Next, you will complete your personal profile and school details.
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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Principal Full Name"
            placeholder="Dr. Rajesh Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User size={18} />}
            required
          />

          <Input
            label="Official / Contact Email"
            type="email"
            placeholder="principal@dpsnoida.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <Input
            label="Account Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            helperText="Minimum 6 characters with letters and numbers."
            required
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={loading}
            icon={<ArrowRight size={18} />}
            style={{ marginTop: '8px', width: '100%' }}
          >
            Create Account & Continue
          </Button>
        </form>

        <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
          By registering, you represent authorization by your school board or institution.
        </p>
      </div>
    </Modal>
  );
};
