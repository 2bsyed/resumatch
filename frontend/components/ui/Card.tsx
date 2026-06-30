import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', level = 1, interactive, children, ...props }, ref) => {
    const baseStyles = 'rounded-[8px] transition-all duration-200';
    
    let depthStyles = '';
    if (level === 1) {
      depthStyles = 'bg-brand-level1 border border-brand-level1Border';
    } else {
      depthStyles = 'bg-brand-level2 border border-brand-level2Border';
    }
    
    let interactiveStyles = '';
    if (interactive) {
      interactiveStyles = 'hover:border-brand-primary hover:glow-primary cursor-pointer';
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${depthStyles} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
