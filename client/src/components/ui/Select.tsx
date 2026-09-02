import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder = 'Select an option',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'var(--bg-input)',
          color: 'var(--text-main)',
          border: error ? '1px solid #EF4444' : '1px solid var(--border-card)',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
        className={className}
        {...props}
      >
        <option value="" disabled style={{ background: '#FFFFFF', color: 'var(--text-dim)' }}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#FFFFFF', color: 'var(--text-main)' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: '12px', color: '#EF4444' }}>{error}</span>}
    </div>
  );
};
