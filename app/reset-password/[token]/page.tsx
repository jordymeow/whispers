'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    document.title = 'Reset Password | Whispers';
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const resolvedParams = await params;
      const tokenValue = resolvedParams.token;
      setToken(tokenValue);

      try {
        const res = await fetch(`/api/auth/reset-password?token=${tokenValue}`);
        const data = await res.json();

        if (data.valid) {
          setTokenValid(true);
          setUserEmail(data.email);
        } else {
          setError(data.error || 'Invalid or expired reset link');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Failed to validate reset link');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="page-center">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Validating reset link...
        </p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="page-center">
        <div style={{ width: '100%', maxWidth: '24rem' }}>
          <div className="page-header">
            <h1>Invalid Reset Link</h1>
            <p>This link has expired or is invalid</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⚠️</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {error || 'This password reset link is no longer valid.'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
              Password reset links expire after 1 hour for security reasons.
            </p>
            <Link href="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-center">
        <div style={{ width: '100%', maxWidth: '24rem' }}>
          <div className="page-header">
            <h1>Password Reset!</h1>
            <p>Your password has been changed</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✅</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Your password has been successfully reset.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
              Redirecting to login...
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Go to Login
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
          <h1>Reset Password</h1>
          <p>Choose a new password for your account</p>
        </div>

        <div className="card">
          {userEmail && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(158, 160, 255, 0.1)',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-secondary)' }}>
                Resetting password for: <strong>{userEmail}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
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
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/login" className="nav-link" style={{ marginRight: '1rem' }}>
            Back to Login
          </Link>
          <Link href="/" className="nav-link">
            ← Back to whispers
          </Link>
        </div>
      </div>
    </div>
  );
}