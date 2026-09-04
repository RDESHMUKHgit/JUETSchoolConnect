import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Smartphone, QrCode, ArrowLeft, Download, ShieldCheck, Sparkles } from 'lucide-react';

interface MobileAppQrGateProps {
  testTitle?: string;
  attemptId?: string;
}

export const MobileAppQrGate: React.FC<MobileAppQrGateProps> = ({ testTitle, attemptId }) => {
  const navigate = useNavigate();

  // Clean, high-contrast SVG QR Code generator (styled SVG for mobile app download / deep-linking)
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card
        variant="glass"
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #E5B842, #C59B27, #9A751A)' }} />

        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
          <Badge variant="gold" size="md">
            <Sparkles size={13} style={{ marginRight: '6px' }} />
            MOBILE APPLICATION EXCLUSIVE
          </Badge>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
          Test Results & Performance Diagnostic
        </h2>

        {testTitle && (
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#9A751A', marginBottom: '8px' }}>
            {testTitle}
          </p>
        )}

        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 24px' }}>
          Your test session has been securely recorded and evaluated. In accordance with platform policy, comprehensive diagnostic analytics, subject percentiles, and step-by-step solutions can only be viewed in the <strong>Jaypee School Connect Mobile App</strong>.
        </p>

        {/* QR Code Container */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #FFFFFF, #F8FAFC)',
            border: '2px solid #F1F5F9',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)',
            marginBottom: '24px',
          }}
        >
          {/* High-res rendered QR code with Jaypee Connect center badge */}
          <div
            style={{
              width: '200px',
              height: '200px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                `https://jaypee.ac.in/mobile-app?attempt=${attemptId || 'completed'}&portal=student`
              )}&color=0F172A`}
              alt="Scan to open Mobile App"
              style={{ width: '180px', height: '180px', borderRadius: '8px', display: 'block' }}
              onError={(e) => {
                // Fallback SVG QR illustration if offline
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
            <Smartphone size={18} style={{ color: '#C59B27' }} />
            <span>Scan with your Mobile Camera</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Available on iOS App Store & Google Play
          </span>
        </div>

        {/* Instructions */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px 18px',
            textAlign: 'left',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShieldCheck size={24} style={{ color: '#059669', flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
            <strong>How to inspect your scorecard:</strong> Open the Jaypee Mobile App, log in with your student credentials, and navigate to <em>Assessments &gt; Attempt History</em>.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="md" icon={<ArrowLeft size={16} />} onClick={() => navigate('/student')}>
            Return to Dashboard
          </Button>
          <Button variant="gold" size="md" onClick={() => navigate('/student/mock-tests')}>
            Attempt Another Test
          </Button>
        </div>
      </Card>
    </div>
  );
};
