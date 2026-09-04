import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        paddingTop: '64px',
        paddingBottom: '36px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #E5B842 0%, #C59B27 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F172A',
                }}
              >
                <GraduationCap size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                SCHOOL CONNECT
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              The premier School–Student Intelligence Platform bridging high schools, Class 12 aspirants, and academic excellence through predictive standardized assessments and deep performance analytics.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '15px', color: '#0F172A', fontWeight: 700, letterSpacing: '0.02em' }}>
              Platform Navigation
            </h4>
            <Link to="/about" style={{ fontSize: '14px', color: '#475569' }}>About Platform</Link>
            <Link to="/how-it-works" style={{ fontSize: '14px', color: '#475569' }}>How It Works</Link>
            <Link to="/schools" style={{ fontSize: '14px', color: '#475569' }}>For Schools & Principals</Link>
            <Link to="/teachers" style={{ fontSize: '14px', color: '#475569' }}>For Class 12 Teachers</Link>
            <Link to="/students" style={{ fontSize: '14px', color: '#475569' }}>For Class 12 Students</Link>
          </div>

          {/* Column 3: Portals & Access */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '15px', color: '#0F172A', fontWeight: 700, letterSpacing: '0.02em' }}>
              Role Portals
            </h4>
            <Link to="/login" style={{ fontSize: '14px', color: '#475569' }}>Student Portal Login</Link>
            <Link to="/login" style={{ fontSize: '14px', color: '#475569' }}>Teacher Portal Login</Link>
            <Link to="/login" style={{ fontSize: '14px', color: '#475569' }}>Principal Portal Login</Link>
            <Link to="/register-school" style={{ fontSize: '14px', color: '#9A751A', fontWeight: 600 }}>
              Register Your School
            </Link>
          </div>

          {/* Column 4: Contact & Institutional Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '15px', color: '#0F172A', fontWeight: 700, letterSpacing: '0.02em' }}>
              Institutional Support
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569', fontSize: '13px' }}>
              <MapPin size={18} style={{ color: '#9A751A', flexShrink: 0, marginTop: '2px' }} />
              <span>National Institutional Intelligence Hub, New Delhi / Noida, India</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
              <Mail size={16} style={{ color: '#9A751A', flexShrink: 0 }} />
              <span>support@schoolconnect.edu.in</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '13px' }}>
              <Phone size={16} style={{ color: '#9A751A', flexShrink: 0 }} />
              <span>+91-120-2400973 / 975</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & compliance */}
        <div
          style={{
            borderTop: '1px solid #E2E8F0',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          <div>
            © {new Date().getFullYear()} School Connect. Built for Indian High School Intelligence.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
            <span>Academic Integrity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
