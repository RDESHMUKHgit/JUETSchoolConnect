import React, { useEffect, useState } from 'react';
import { ShieldAlert, Maximize2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ExamSecurityShieldProps {
  onViolation?: (type: string) => void;
  children: React.ReactNode;
}

/**
 * ExamSecurityShield
 * Provides client-side deterrence during high-stakes exams:
 * - Automatic Fullscreen mode prompt & recovery
 * - Right-click context menu disable
 * - Developer tools shortcut deterrence (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * - Refresh & print deterrents (F5, Ctrl+R, Ctrl+P, Ctrl+S)
 * - History / Back button trapping
 * - Tab visibility tracking & warnings
 */
export const ExamSecurityShield: React.FC<ExamSecurityShieldProps> = ({ onViolation, children }) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!document.fullscreenElement);
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
    // Attempt automatic fullscreen on initial load
    if (!document.fullscreenElement) {
      enterFullscreen().catch(() => {
        // Will show fullscreen required overlay
      });
    }

    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setWarningMessage('Security Alert: You exited full-screen mode. Please return to full-screen immediately.');
        if (onViolation) onViolation('exit_fullscreen');
      }
    };

    // 2. Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Intercept common inspection and refresh keys
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 or F5
      if (e.key === 'F12' || e.key === 'F5') {
        e.preventDefault();
        setWarningMessage('Function keys are disabled during the examination.');
        return false;
      }

      // Ctrl/Cmd + R (Refresh)
      if (isCtrlOrMeta && key === 'R') {
        e.preventDefault();
        setWarningMessage('Page refreshing is disabled during the active exam.');
        return false;
      }

      // Ctrl/Cmd + P (Print)
      if (isCtrlOrMeta && key === 'P') {
        e.preventDefault();
        setWarningMessage('Printing or screen capture is disabled.');
        return false;
      }

      // Ctrl/Cmd + S (Save)
      if (isCtrlOrMeta && key === 'S') {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + U (View Source)
      if (isCtrlOrMeta && key === 'U') {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + I / J / C (DevTools)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'J', 'C'].includes(key)) {
        e.preventDefault();
        return false;
      }

      // Alt + Left Arrow / Alt + Right Arrow (Browser History)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        return false;
      }

      // Backspace when not in input/textarea
      if (e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
        if (!isInput) {
          e.preventDefault();
          return false;
        }
      }
    };

    // 4. Tab visibility change (blur / focus)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setWarningMessage(`Warning #${next}: Tab switching or minimizing during the examination is strictly logged.`);
          if (onViolation) onViolation('tab_switch');
          return next;
        });
      }
    };

    // 5. BeforeUnload warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your test is currently active. Leaving will not stop the timer.';
      return e.returnValue;
    };

    // 6. Trap browser back button via pushState & popstate
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setWarningMessage('Backward navigation is blocked in this standardized test. Use the on-screen controls.');
      if (onViolation) onViolation('back_button');
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onViolation]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', userSelect: 'none' }}>
      {/* Banner alert if violation triggered */}
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

      {/* Viewport-blocking recovery modal if exited fullscreen */}
      {!isFullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle size={36} style={{ color: '#F59E0B' }} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Full-Screen Exam Mode Required
          </h2>
          <p style={{ maxWidth: '480px', color: '#CBD5E1', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            To preserve standardized test integrity, the School Connect Examination Engine requires full-screen operation. Click the button below to resume your assessment.
          </p>
          <Button
            size="lg"
            variant="gold"
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
