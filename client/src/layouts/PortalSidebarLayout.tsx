import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, GraduationCap, Menu, X, Shield, School, BookOpen, User } from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface PortalSidebarLayoutProps {
  portalTitle: string;
  portalRole: 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';
  navItems: NavItem[];
  children: React.ReactNode;
}

export const PortalSidebarLayout: React.FC<PortalSidebarLayoutProps> = ({
  portalTitle,
  portalRole,
  navItems,
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(portalRole === 'ADMIN' ? '/admin' : '/login');
  };

  const getRoleIcon = () => {
    switch (portalRole) {
      case 'ADMIN': return <Shield size={18} style={{ color: '#E11D48' }} />;
      case 'PRINCIPAL': return <School size={18} style={{ color: '#9A751A' }} />;
      case 'TEACHER': return <BookOpen size={18} style={{ color: '#0284C7' }} />;
      case 'STUDENT': default: return <User size={18} style={{ color: '#059669' }} />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (portalRole) {
      case 'ADMIN': return 'danger';
      case 'PRINCIPAL': return 'gold';
      case 'TEACHER': return 'info';
      case 'STUDENT': default: return 'success';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'transparent' }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
        className="portal-desktop-sidebar"
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #E5B842 0%, #C59B27 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              SCHOOL CONNECT
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Badge variant={getRoleBadgeVariant() as any} size="sm">
                {portalRole}
              </Badge>
            </div>
          </div>
        </div>

        {/* User Snapshot */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getRoleIcon()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.fullName || user?.email}
            </div>
            {user?.schoolName && (
              <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.schoolName}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = item.isActive !== undefined
              ? item.isActive
              : (location.pathname + location.search) === item.path || location.pathname === item.path;
            return (
              <Link
                key={item.label + item.path}
                to={item.path}
                onClick={(e) => {
                  if (item.onClick) {
                    item.onClick();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#9A751A' : '#475569',
                  backgroundColor: isActive ? '#FEFCE8' : 'transparent',
                  border: isActive ? '1px solid #FDE047' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? '#9A751A' : 'inherit' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && <Badge variant="gold" size="sm">{item.badge}</Badge>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #E2E8F0' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              color: '#DC2626',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Header */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
          className="portal-mobile-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>{portalTitle}</span>
            <Badge variant={getRoleBadgeVariant() as any} size="sm">{portalRole}</Badge>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'transparent', color: '#0F172A', border: 'none', padding: '4px', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Mobile Slide-out Menu */}
        {mobileOpen && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            }}
          >
            {navItems.map((item) => {
              const isActive = item.isActive !== undefined
                ? item.isActive
                : (location.pathname + location.search) === item.path || location.pathname === item.path;
              return (
                <Link
                  key={item.label + item.path}
                  to={item.path}
                  onClick={(e) => {
                    setMobileOpen(false);
                    if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#9A751A' : '#334155',
                    backgroundColor: isActive ? '#FEFCE8' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '6px',
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}

        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }} className="portal-content-main">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .portal-desktop-sidebar { display: none !important; }
          .portal-mobile-header { display: flex !important; }
          .portal-content-main { padding: 20px 16px !important; }
        }
        @media (min-width: 901px) {
          .portal-mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  );
};
