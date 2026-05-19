import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'action' | 'action-app' | 'action-rej' | 'action-ft' | 'action-vw' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

export function Button({ variant = 'primary', size = 'md', className = '', asChild, ...props }: ButtonProps) {
  let baseStyles = 'font-sans uppercase font-bold text-center transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  if (size === 'sm') {
    baseStyles += ' text-[10px] tracking-[0.15em] px-4 py-2';
  } else if (size === 'md') {
    baseStyles += ' text-[11px] tracking-[0.15em] px-7 py-3';
  } else if (size === 'lg') {
    baseStyles += ' text-[13px] tracking-[0.15em] px-8 py-4';
  } else if (size === 'icon') {
    baseStyles += ' p-0 aspect-square';
  }

  let variantStyles = '';
  switch (variant) {
    case 'primary': // Admin top buttons mainly
      variantStyles = 'border-[1.5px] border-black bg-white text-black hover:bg-black hover:text-white';
      break;
    case 'accent':
      variantStyles = 'border-[1.5px] border-black bg-accent text-black hover:bg-black hover:text-accent';
      break;
    case 'action':
      variantStyles = 'border border-black bg-white text-black hover:bg-gray-100';
      break;
    case 'action-app':
      variantStyles = 'border border-black bg-white text-black hover:bg-success hover:border-black';
      break;
    case 'action-rej':
      variantStyles = 'border border-black bg-white text-black hover:bg-black hover:text-white';
      break;
    case 'action-vw':
      variantStyles = 'border border-black bg-white text-black hover:bg-accent';
      break;
    case 'action-ft':
      variantStyles = 'border border-black bg-accent text-black hover:bg-black hover:text-white';
      break;
    case 'ghost':
      variantStyles = 'border-none bg-transparent hover:bg-black hover:text-white';
      break;
    case 'outline':
      variantStyles = 'border-[1.5px] border-black bg-white text-black hover:bg-black/5';
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {props.children}
    </button>
  );
}
