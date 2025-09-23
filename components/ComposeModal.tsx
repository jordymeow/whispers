'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ComposeForm } from './ComposeForm';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ComposeModal({ isOpen, onClose, onSuccess }: ComposeModalProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
      setToast(null);
    }, 500);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    if (type === 'success') {
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="card" style={{
          padding: '2rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '100%',
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="btn-outline"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {toast && (
            <div className={`message message-${toast.type}`} style={{ marginBottom: '1rem' }}>
              {toast.message}
            </div>
          )}

          <ComposeForm
            onSuccess={handleSuccess}
            showToast={showToast}
          />
        </div>
      </div>
    </>
  );
}