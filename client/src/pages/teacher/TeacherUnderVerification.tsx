import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Clock, RefreshCw, LogOut, School } from 'lucide-react';

export const TeacherUnderVerification: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await refreshUser();
    if (user?.status === 'VERIFIED') {
      navigate('/teacher');
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
            background: '#F0F9FF',
            border: '2px solid #BAE6FD',
            color: '#0284C7',
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
          <Badge variant="info" size="md">STATUS: AWAITING PRINCIPAL APPROVAL</Badge>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '14px', marginBottom: '12px' }}>
          Teacher Account Pending Approval
        </h2>

        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
          Your profile details have been submitted. Under platform security policy, faculty accounts must be approved <strong>strictly by your School Principal</strong> before student academic records can be accessed.
        </p>

        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '28px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', marginBottom: '8px' }}>
            <School size={16} style={{ color: '#0284C7' }} />
            <span>School: <strong>{user?.schoolName || 'Your School'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px' }}>
            <School size={16} style={{ color: '#0284C7' }} />
            <span>Faculty Name: <strong>{user?.fullName || user?.email}</strong></span>
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
