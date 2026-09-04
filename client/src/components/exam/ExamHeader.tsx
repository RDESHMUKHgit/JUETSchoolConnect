import React, { useEffect, useState } from 'react';
import { Clock, Send, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';

interface ExamHeaderProps {
  testTitle: string;
  subjects?: string[];
  durationMinutes: number;
  startedAt: number;
  studentName?: string;
  studentRoll?: string;
  onTimeUp: () => void;
  onSubmitClick: () => void;
  submitting?: boolean;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  testTitle,
  subjects = [],
  durationMinutes,
  startedAt,
  studentName,
  studentRoll,
  onTimeUp,
  onSubmitClick,
  submitting = false,
}) => {
  // Compute remaining seconds from startedAt to prevent reset on reload
  const calculateRemaining = () => {
    const totalMs = durationMinutes * 60 * 1000;
    const elapsedMs = Date.now() - startedAt;
    return Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      const rem = calculateRemaining();
      setRemainingSeconds(rem);
      if (rem <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, onTimeUp]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isCritical = remainingSeconds <= 60; // Under 1 min
  const isWarning = remainingSeconds <= 300 && !isCritical; // Under 5 mins

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Test Title & Subject badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
            color: '#F59E0B',
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {testTitle}
            </h1>
            {subjects.map((sub, i) => (
              <Badge key={i} variant="gold" size="sm">
                {sub}
              </Badge>
            ))}
          </div>
          {studentName && (
            <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>
              Candidate: <strong style={{ color: '#334155' }}>{studentName}</strong>
              {studentRoll ? ` (${studentRoll})` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Countdown Timer & Submit CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Anti-cheat countdown timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: isCritical
              ? '1px solid #FCA5A5'
              : isWarning
              ? '1px solid #FDE68A'
              : '1px solid #E2E8F0',
            backgroundColor: isCritical
              ? '#FEF2F2'
              : isWarning
              ? '#FFFBEB'
              : '#F8FAFC',
            color: isCritical
              ? '#DC2626'
              : isWarning
              ? '#D97706'
              : '#0F172A',
            transition: 'all 0.3s ease',
            animation: isCritical ? 'pulse 1s infinite' : 'none',
          }}
        >
          <Clock size={18} style={{ color: isCritical ? '#DC2626' : isWarning ? '#D97706' : '#2563EB' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, opacity: 0.8 }}>
              Time Remaining
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          variant="primary"
          icon={<Send size={15} />}
          onClick={onSubmitClick}
          loading={submitting}
          style={{
            background: '#16A34A',
            borderColor: '#15803D',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          Submit Test
        </Button>
      </div>
    </header>
  );
};
