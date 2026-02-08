'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Login | Whispers';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      if (data.success && data.redirectTo) {
        router.replace(data.redirectTo);
        router.refresh();
        return;
      }

      setError('Login failed. Please try again.');
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '24rem' }}>
        <div className="page-header">
          <h1>Welcome Back</h1>
          <p>Enter your quiet space</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Username or Email</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="Username or email"
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
                placeholder="Your password"
                autoComplete="current-password"
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
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link href="/forgot-password" className="nav-link" style={{ fontSize: '0.875rem' }}>
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/register" className="nav-link" style={{ marginRight: '1rem' }}>
            Need an account?
          </Link>
          <Link href="/" className="nav-link">
            ← Back to whispers
          </Link>
        </div>
      </div>
    </div>
  );
}
