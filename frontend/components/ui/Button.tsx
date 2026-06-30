import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none font-mono text-xs tracking-wider uppercase font-semibold py-2.5 px-5';
    
    let variantStyles = '';
    
    if (variant === 'primary') {
      variantStyles = 'bg-brand-primary text-white hover:bg-blue-400 hover:glow-primary rounded-[6px]';
    } else if (variant === 'secondary') {
      variantStyles = 'bg-transparent border border-brand-level1Border text-[#F9FAFB] hover:bg-brand-level1 rounded-[6px]';
    } else if (variant === 'ghost') {
      variantStyles = 'bg-transparent text-on-surface-variant hover:text-white hover:bg-brand-level1 rounded-[6px]';
    } else if (variant === 'danger') {
      variantStyles = 'bg-error text-on-error hover:bg-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] rounded-[6px]';
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
