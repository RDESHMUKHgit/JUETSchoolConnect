import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Clock, RefreshCw, LogOut, GraduationCap, School } from 'lucide-react';

export const StudentUnderVerification: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await refreshUser();
    if (user?.status === 'VERIFIED') {
      navigate('/student');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card variant="glass" padding="lg" style={{ width: '100%', maxWidth: '540px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ECFDF5',
            border: '2px solid #A7F3D0',
            color: '#059669',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'pulseGold 2s infinite',
          }}
        >
          <Clock size={32} />
        </div>

        <div>
          <Badge variant="success" size="md">STATUS: AWAITING SCHOOL VERIFICATION</Badge>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '14px', marginBottom: '12px' }}>
          Registration Submitted
        </h2>

        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
          Your student profile for <strong>Class 12</strong> has been linked to your institution. Your school principal or designated faculty administrator will verify your admission credentials before your mock test cockpit unlocks.
        </p>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', marginBottom: '8px' }}>
            <School size={16} style={{ color: '#059669' }} />
            <span>School: <strong>{user?.schoolName || 'Selected School'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px' }}>
            <GraduationCap size={16} style={{ color: '#059669' }} />
            <span>Student: <strong>{user?.fullName || user?.email}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="primary" icon={<RefreshCw size={16} />} onClick={handleRefresh}>
            Check Approval Status
          </Button>
          <Button variant="secondary" icon={<LogOut size={16} />} onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
