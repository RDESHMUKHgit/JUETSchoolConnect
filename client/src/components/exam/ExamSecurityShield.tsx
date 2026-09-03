import React, { useEffect, useState } from 'react';
import { ShieldAlert, Maximize2 } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ExamSecurityShieldProps {
  onViolation?: (type: string) => void;
  children: React.ReactNode;
}

/**
 * ExamSecurityShield
 * Provides client-side deterrence during high-stakes exams:
 * - Fullscreen mode prompt & recovery
 * - Right-click context menu disable
 * - Developer tools shortcut deterrence (F12, Ctrl+Shift+I/J, Ctrl+U)
 * - Tab visibility tracking & warnings
 */
export const ExamSecurityShield: React.FC<ExamSecurityShieldProps> = ({ onViolation, children }) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Request fullscreen
  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      }
      setIsFullscreen(true);
      setWarningMessage(null);
    } catch (err) {
      console.warn('Fullscreen request bypassed or denied:', err);
    }
  };

  useEffect(() => {
    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setWarningMessage('Security Warning: You exited fullscreen mode. Please return to fullscreen immediately.');
        if (onViolation) onViolation('exit_fullscreen');
      }
    };

    // 2. Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Intercept common inspection keys
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl + Shift + I / J / C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
      }
      // Ctrl + U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        return false;
      }
    };

    // 4. Tab visibility change (blur / focus)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setWarningMessage(`Warning #${next}: Tab switching or minimizing during the examination is strictly monitored.`);
          if (onViolation) onViolation('tab_switch');
          return next;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onViolation]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', userSelect: 'none' }}>
      {/* Banner alert if tab switched */}
      {warningMessage && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <ShieldAlert size={18} />
          <span>{warningMessage}</span>
          <button
            onClick={() => setWarningMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 700,
              marginLeft: '8px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Fullscreen overlay if student exited fullscreen */}
      {!isFullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <ShieldAlert size={56} style={{ color: '#F59E0B', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Full-Screen Exam Mode Required
          </h2>
          <p style={{ maxWidth: '460px', color: '#CBD5E1', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            To preserve test integrity, the Jaypee Examination Engine must run in dedicated full-screen mode. Please click the button below to resume.
          </p>
          <Button
            size="lg"
            variant="primary"
            icon={<Maximize2 size={18} />}
            onClick={enterFullscreen}
            style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 700 }}
          >
            Re-Enter Full-Screen Mode
          </Button>
        </div>
      )}

      {children}
    </div>
  );
};
