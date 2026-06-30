import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="label-mono text-[10px] text-on-surface-variant uppercase font-semibold">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            bg-brand-level1 
            border 
            border-brand-level1Border 
            rounded-[4px] 
            px-3 
            py-2 
            text-sm 
            text-on-surface 
            placeholder-on-surface-variant/40
            focus:outline-none 
            focus:border-brand-primary 
            transition-colors
            disabled:opacity-50 
            disabled:cursor-not-allowed
            ${error ? 'border-error focus:border-error' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[11px] text-error font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
