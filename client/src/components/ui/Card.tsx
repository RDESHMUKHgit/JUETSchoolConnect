import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'gold' | 'solid';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  className = '',
  style,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'gold':
        return 'glass-panel-gold';
      case 'solid':
        return 'glass-panel';
      case 'glass':
      default:
        return 'glass-panel';
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '16px';
      case 'lg':
        return '32px';
      case 'md':
      default:
        return '24px';
    }
  };

  return (
    <div
      className={`${getVariantClass()} ${className}`}
      style={{
        padding: getPadding(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
