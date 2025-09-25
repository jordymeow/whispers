'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Register | Whispers';
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else if (data.redirectTo) {
        // First user (admin) - direct login
        router.push(data.redirectTo);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '24rem' }}>
        <div className="page-header">
          <h1>Join Whispers</h1>
          <p>Create your account to share quietly</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                autoComplete="name"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  // Only allow lowercase letters, numbers, and hyphens
                  const cleaned = value.replace(/[^a-z0-9-]/g, '');
                  setUsername(cleaned);

                  // Validate username
                  if (cleaned && cleaned.length < 3) {
                    setUsernameError('Username must be at least 3 characters');
                  } else if (cleaned && !/^[a-z][a-z0-9-]*$/.test(cleaned)) {
                    setUsernameError('Username must start with a letter');
                  } else {
                    setUsernameError('');
                  }
                }}
                placeholder="Choose a unique username"
                autoComplete="username"
                disabled={loading}
              />
            </div>
            {usernameError && (
              <p className="text-sm text-red-500 mt-1">{usernameError}</p>
            )}

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Check if passwords match when password changes
                  if (confirmPassword && e.target.value !== confirmPassword) {
                    setPasswordError('Passwords do not match');
                  } else {
                    setPasswordError('');
                  }
                }}
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
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  // Check if passwords match
                  if (password && e.target.value !== password) {
                    setPasswordError('Passwords do not match');
                  } else {
                    setPasswordError('');
                  }
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}

            {error && (
              <div className="message message-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading || !username || !password || !confirmPassword || !name || !email || !!usernameError || !!passwordError}
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
          <Link href="/login" className="nav-link" style={{ marginRight: '1rem' }}>
            Already have an account?
          </Link>
          <Link href="/" className="nav-link">
            ← Back to whispers
          </Link>
        </div>
      </div>
    </div>
  );
}
