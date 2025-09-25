'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/register');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setError('');
      alert('Verification code sent to your email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '24rem' }}>
        <div className="page-header">
          <h1>Verify Email</h1>
          {email && (
            <p>We sent a 6-digit code to {email}</p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="font-mono text-center text-xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
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
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={handleResend}
                className="nav-link"
                style={{ fontSize: '0.875rem' }}
                disabled={loading}
                type="button"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/login" className="nav-link">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}