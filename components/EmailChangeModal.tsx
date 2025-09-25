'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface EmailChangeModalProps {
  isOpen: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}

export function EmailChangeModal({ isOpen, currentEmail, onClose, onSuccess }: EmailChangeModalProps) {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
      };
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep('email');
    setNewEmail('');
    setVerificationCode('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newEmail.trim()) {
      setError('Please enter a new email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError('This is already your current email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send verification code');
        return;
      }

      setStep('verify');
      setError('');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newEmail.trim(),
          code: verificationCode.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid verification code');
        return;
      }

      onSuccess(newEmail);
      handleClose();
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 6, 10, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={handleClose}
      />

      {/* Modal Container - Centers in viewport */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001,
          pointerEvents: 'none',
        }}
      >
        {/* Modal Content */}
        <div
          style={{
            width: 'min(420px, 90vw)',
            maxHeight: '85vh',
            background: 'rgba(18, 20, 30, 0.95)',
            borderRadius: '1rem',
            border: '1px solid rgba(158, 160, 255, 0.3)',
            boxShadow: '0 28px 80px rgba(5, 6, 12, 0.55)',
            padding: '2rem',
            overflowY: 'auto',
            pointerEvents: 'auto',
            animation: 'modalGrow 0.3s ease',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '0.95rem',
          }}
        >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 0,
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {step === 'email' ? (
          <>
            <h3 className="settings-section" style={{ marginBottom: '0.5rem' }}>
              Change Email Address
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Current: {currentEmail}
            </p>

            <form onSubmit={handleEmailSubmit}>
              <div className="form-field">
                <label htmlFor="new-email">New Email Address</label>
                <input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="message message-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading || !newEmail}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className="loading-spinner"></span>
                    Sending Code...
                  </span>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h3 className="settings-section" style={{ marginBottom: '0.5rem' }}>
              Verify New Email
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              We've sent a verification code to:
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>{newEmail}</strong>
            </p>

            <form onSubmit={handleVerifySubmit}>
              <div className="form-field">
                <label htmlFor="verification-code">Verification Code</label>
                <input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={loading}
                  maxLength={6}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    letterSpacing: '0.15rem',
                    textAlign: 'center'
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  marginTop: '0.5rem'
                }}>
                  Check your email for the verification code
                </p>
              </div>

              {error && (
                <div className="message message-error">
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setStep('email');
                    setVerificationCode('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-outline"
                  style={{
                    flex: 1,
                    background: 'var(--accent-bright)',
                    color: '#0a0a12',
                    borderColor: 'transparent'
                  }}
                  disabled={loading || !verificationCode}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span className="loading-spinner"></span>
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
        </div>
      </div>
    </>,
    document.body
  );
}