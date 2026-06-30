import React from 'react';

interface PulseBarProps {
  isActive?: boolean;
  className?: string;
}

export default function PulseBar({ isActive = true, className = '' }: PulseBarProps) {
  if (!isActive) return null;

  return (
    <div className={`w-full bg-brand-level1Border/20 rounded-full overflow-hidden ${className}`}>
      {/* 4px height slider using prompt specification */}
      <div className="pulse-bar w-full h-1 rounded-full"></div>
    </div>
  );
}
