import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'gold' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return {
          background: '#ECFDF5',
          color: '#047857',
          border: '1px solid #A7F3D0',
        };
      case 'warning':
        return {
          background: '#FFFBEB',
          color: '#B45309',
          border: '1px solid #FDE68A',
        };
      case 'danger':
        return {
          background: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FECACA',
        };
      case 'gold':
        return {
          background: '#FEFCE8',
          color: '#854D0E',
          border: '1px solid #FDE047',
        };
      case 'info':
        return {
          background: '#F0F9FF',
          color: '#0369A1',
          border: '1px solid #BAE6FD',
        };
      case 'default':
      default:
        return {
          background: '#F1F5F9',
          color: '#475569',
          border: '1px solid #CBD5E1',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        ...getStyles(),
      }}
    >
      {children}
    </span>
  );
};
