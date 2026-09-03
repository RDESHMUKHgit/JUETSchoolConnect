import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-main)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--text-dim)',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: icon ? '12px 14px 12px 42px' : '12px 16px',
            background: 'var(--bg-input)',
            color: 'var(--text-main)',
            border: error ? '1px solid #EF4444' : '1px solid var(--border-card)',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : '#C59B27';
            e.target.style.boxShadow = error
              ? '0 0 0 3px rgba(239, 68, 68, 0.2)'
              : '0 0 0 3px rgba(197, 155, 39, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : 'var(--border-card)';
            e.target.style.boxShadow = 'none';
          }}
          className={className}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px' }}>{error}</span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{helperText}</span>
      )}
    </div>
  );
};
