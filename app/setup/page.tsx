'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingSetup();
  }, []);

  const checkExistingSetup = async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        const data = await res.json();
        if (data.hasUsers) {
          router.push('/login');
          return;
        }
      }
    } catch (error) {
      console.error('Setup check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        }),
      });

      const data = await res.json();
      console.log('Setup response:', data);

      if (!res.ok) {
        setError(data.error || 'Setup failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.success) {
        console.log('Setup successful, redirecting...');
        // Force a hard redirect to ensure cookies are read
        window.location.href = '/admin';
      } else {
        setError('Setup failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Setup error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="page-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '24rem' }}>
        <div className="page-header">
          <h1>Welcome</h1>
          <p>Create your space for quiet thoughts</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose your username"
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
              disabled={loading || !username || !password || !confirmPassword}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Creating...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="nav-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}