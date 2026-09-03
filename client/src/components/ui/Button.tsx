import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'gold':
        return {
          background: 'linear-gradient(135deg, #E5B842 0%, #C59B27 100%)',
          color: '#0F172A',
          fontWeight: 700,
          border: '1px solid rgba(197, 155, 39, 0.5)',
          boxShadow: '0 2px 10px rgba(197, 155, 39, 0.25)',
        };
      case 'secondary':
        return {
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #CBD5E1',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: '#9A751A',
          border: '1.5px solid #C59B27',
          fontWeight: 600,
        };
      case 'danger':
        return {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
          fontWeight: 600,
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#475569',
        };
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', fontSize: '13px', borderRadius: '6px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '16px', borderRadius: '12px' };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '14px', borderRadius: '8px' };
    }
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        ...getSizeStyles(),
        ...getVariantStyles(),
      }}
      className={className}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.75s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
