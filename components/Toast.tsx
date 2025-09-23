'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '0.75rem 1.25rem',
        background: type === 'success'
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.25))',
        border: `1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        borderRadius: '0.5rem',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        animation: 'slideInUp 0.3s ease-out',
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
}