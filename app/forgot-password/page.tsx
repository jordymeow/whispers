'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Forgot Password | Whispers';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-center">
        <div style={{ width: '100%', maxWidth: '24rem' }}>
          <div className="page-header">
            <h1>Check Your Email</h1>
            <p>We've sent you a password reset link</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📧</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              If an account exists for <strong>{email}</strong>, you'll receive an email with instructions to reset your password.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
              The link will expire in 1 hour for security reasons.
            </p>

            <div style={{
              padding: '1rem',
              background: 'rgba(158, 160, 255, 0.1)',
              borderRadius: '0.5rem',
              marginBottom: '2rem'
            }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    font: 'inherit'
                  }}
                >
                  try again
                </button>
              </p>
            </div>

            <Link href="/login" className="btn btn-outline" style={{ width: '100%' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '24rem' }}>
        <div className="page-header">
          <h1>Forgot Password?</h1>
          <p>Enter your email to reset your password</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                We'll send a password reset link to this email
              </p>
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
              disabled={loading || !email}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/login" className="nav-link" style={{ marginRight: '1rem' }}>
            Remember your password?
          </Link>
          <Link href="/" className="nav-link">
            ← Back to whispers
          </Link>
        </div>
      </div>
    </div>
  );
}