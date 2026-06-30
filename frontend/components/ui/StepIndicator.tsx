import React from 'react';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  steps?: string[];
}

export default function StepIndicator({ 
  currentStep, 
  steps = ['Upload CV', 'Job Description', 'Your Results'] 
}: StepIndicatorProps) {
  return (
    <div className="mb-10 w-full max-w-2xl">
      <div className="flex flex-wrap items-center gap-y-4 gap-x-2 md:gap-x-4">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          
          return (
            <React.Fragment key={stepNum}>
              {/* Connector line for steps > 1 */}
              {index > 0 && (
                <div 
                  className={`h-[1px] w-6 md:w-8 transition-colors duration-300 ${
                    currentStep > index ? 'bg-secondary' : 'bg-[#374151]'
                  }`}
                />
              )}

              {/* Step indicator node */}
              <div className="flex items-center gap-2">
                <div 
                  className={`
                    w-6 
                    h-6 
                    rounded-full 
                    flex 
                    items-center 
                    justify-center 
                    font-mono 
                    text-[12px] 
                    font-bold
                    transition-all
                    duration-300
                    border
                    ${
                      isCompleted 
                        ? 'bg-secondary border-secondary text-brand-bg shadow-[0_0_8px_rgba(78,222,163,0.4)]'
                        : isActive
                          ? 'bg-primary border-primary text-white shadow-[0_0_8px_rgba(79,142,247,0.5)]'
                          : 'bg-transparent border-[#374151] text-on-surface-variant'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span 
                  className={`
                    font-mono 
                    text-label-mono 
                    uppercase 
                    tracking-wider
                    text-[10px]
                    md:text-[11px]
                    transition-colors
                    duration-300
                    ${isActive || isCompleted ? 'text-white font-bold' : 'text-on-surface-variant'}
                  `}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
