import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, School as SchoolIcon, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  onOpenRegisterSchoolModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegisterSchoolModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Platform', path: '/about' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'For Schools', path: '/schools' },
    { label: 'For Teachers', path: '/teachers' },
    { label: 'For Students', path: '/students' },
    { label: 'About Jaypee University', path: '/jaypee' },
  ];

  const handleRegisterClick = () => {
    if (onOpenRegisterSchoolModal) {
      onOpenRegisterSchoolModal();
    } else {
      navigate('/register-school');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'PRINCIPAL':
        return user.status === 'VERIFIED' ? '/principal' : '/principal/verification';
      case 'TEACHER':
        return user.status === 'VERIFIED' ? '/teacher' : '/teacher/verification';
      case 'STUDENT':
        return user.status === 'VERIFIED' ? '/student' : '/student/verification';
      default:
        return '/login';
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #E5B842 0%, #C59B27 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              boxShadow: '0 4px 14px rgba(197, 155, 39, 0.3)',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              JAYPEE
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9A751A',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              School Connect
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '24px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#9A751A' : '#475569',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#475569';
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs (Strictly 3-role Login + Register School) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(getDashboardLink())}
              >
                Dashboard ({user.role})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={<LogIn size={16} />}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="gold"
                size="sm"
                icon={<SchoolIcon size={16} />}
                onClick={handleRegisterClick}
              >
                Register School
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F1F5F9',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: location.pathname === link.path ? '#9A751A' : '#334155',
                padding: '8px 0',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Login (Student / Teacher / Principal)
            </Button>
            <Button
              variant="gold"
              onClick={() => {
                setMobileMenuOpen(false);
                handleRegisterClick();
              }}
            >
              Register School
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
