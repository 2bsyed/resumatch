'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const getTypeStyle = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'text-secondary border-[#10B981]/30 bg-[#10B981]/5';
      case 'error':
        return 'text-error border-error/30 bg-error/5';
      case 'info':
      default:
        return 'text-clinical-primary border-clinical-primary/30 bg-clinical-primary/5';
    }
  };

  const getIconName = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast container absolute position */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[360px] w-full pointer-events-none select-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border bg-[#111827] shadow-2xl transition-all duration-300 animate-slide-in ${getTypeStyle(toast.type)}`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
              {getIconName(toast.type)}
            </span>
            <div className="flex-grow font-sans text-xs text-white leading-relaxed">
              {toast.message}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-[#4B5563] hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
