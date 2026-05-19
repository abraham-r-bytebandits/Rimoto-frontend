import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'advanced' | 'featured' | 'accent' | 'outline' | 'dark';
  className?: string;
  size?: 'sm' | 'xs';
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }: BadgeProps) {
  let baseStyles = 'inline-flex items-center uppercase font-bold tracking-[0.15em]';
  
  if (size === 'sm') {
    baseStyles += ' text-[10px] px-3 py-1';
  } else if (size === 'xs') {
    baseStyles += ' text-[8px] px-1.5 py-0.5 tracking-[0.05em]';
  }

  let variantStyles = '';
  switch (variant) {
    case 'neutral':
      variantStyles = 'border border-black bg-white text-black';
      break;
    case 'success':
      variantStyles = 'border border-black bg-success text-black';
      break;
    case 'danger':
      variantStyles = 'border border-black bg-black text-white';
      break;
    case 'warning':
      variantStyles = 'border border-black bg-accent text-black';
      break;
    case 'info':
      variantStyles = 'border border-black bg-accent text-black'; // Used for intermediate/etc
      break;
    case 'advanced':
      variantStyles = 'border border-black bg-black text-white';
      break;
    case 'featured':
      variantStyles = 'border border-black bg-accent text-black';
      break;
    case 'accent':
      variantStyles = 'bg-accent text-black'; // No border variant
      break;
    case 'outline':
      variantStyles = 'border border-border-d text-muted bg-white';
      break;
    case 'dark':
      variantStyles = 'bg-black text-white';
      break;
  }

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
}
