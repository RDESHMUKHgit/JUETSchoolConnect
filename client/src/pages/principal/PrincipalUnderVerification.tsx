import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Clock, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';

export const PrincipalUnderVerification: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await refreshUser();
    if (user?.status === 'VERIFIED') {
      navigate('/principal');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card variant="glass" padding="lg" style={{ width: '100%', maxWidth: '560px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-lg)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FFFBEB',
            border: '2px solid #FDE68A',
            color: '#B45309',
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
          <Badge variant="warning" size="md">STATUS: PENDING VERIFICATION</Badge>
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '14px', marginBottom: '12px' }}>
          School Registration Under Review
        </h2>

        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
          Your school details for <strong style={{ color: '#0F172A' }}>{user?.schoolName || 'Your School'}</strong> have been securely recorded. Central Platform Administration manually inspects every institution registration to guarantee accredited participation.
        </p>

        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', textAlign: 'left', marginBottom: '28px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', marginBottom: '8px' }}>
            <ShieldCheck size={16} style={{ color: '#9A751A' }} />
            <span>Principal Account: <strong>{user?.fullName || user?.email}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px' }}>
            <ShieldCheck size={16} style={{ color: '#9A751A' }} />
            <span>Review SLA: Typical verification is processed within 24 to 48 hours.</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="gold" icon={<RefreshCw size={16} />} onClick={handleRefresh}>
            Check Verification Status
          </Button>
          <Button variant="secondary" icon={<LogOut size={16} />} onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
