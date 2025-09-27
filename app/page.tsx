'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import WhisperCard from '@/components/whispers/WhisperCard';
import { DEFAULT_ICON_COLOR, isValidIconColor, type IconColorName } from '@/lib/whispers';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import { Toast } from '@/components/Toast';

interface Post {
  _id: string;
  content: string;
  date: string;
  icon?: string | null;
  color?: IconColorName;
  author?: {
    displayName: string;
    username: string;
  } | null;
}

interface Settings {
  title: string;
  backgroundTheme?: string;
  backgroundTint?: string;
  asciiArt?: string;
  trackingSnippet?: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [timerProgress, setTimerProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    Promise.all([
      checkAuth(),
      fetchSettings(),
      fetchPosts()
    ]).finally(() => setLoading(false));
  }, []);

  // Removed font settings effect - keeping it simple

  useEffect(() => {
    const elementId = 'midnight-whisper-tracking';
    const existing = document.getElementById(elementId);
    if (existing) {
      existing.remove();
    }

    const snippet = settings?.trackingSnippet;
    if (snippet && snippet.trim().length > 0) {
      const container = document.createElement('div');
      container.id = elementId;
      container.innerHTML = snippet;

      const scripts = Array.from(container.querySelectorAll('script'));
      scripts.forEach((script) => {
        const replacement = document.createElement('script');
        Array.from(script.attributes).forEach((attr) => {
          replacement.setAttribute(attr.name, attr.value);
        });
        replacement.textContent = script.textContent;
        script.replaceWith(replacement);
      });

      document.body.appendChild(container);
      return () => {
        container.remove();
      };
    }
    return undefined;
  }, [settings?.trackingSnippet]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      setIsAuthenticated(data.authenticated);

      // If authenticated, fetch user details
      if (data.authenticated) {
        const userRes = await fetch('/api/users/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData?.user) {
            setCurrentUser({
              username: userData.user.username,
              displayName: userData.user.displayName,
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          ...data,
          title: data.title || 'My Whispers',
          trackingSnippet: typeof data.trackingSnippet === 'string' ? data.trackingSnippet : '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoaded(true);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(
            data.map((post) => ({
              ...post,
              icon:
                typeof post.icon === 'string' && post.icon.trim().length > 0
                  ? post.icon.trim()
                  : null,
              color: isValidIconColor(post.color)
                ? (post.color as IconColorName)
                : DEFAULT_ICON_COLOR,
              author: post.author ?? null,
            }))
          );
        } else {
          setPosts([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const expandedWhisper = useMemo(
    () => posts.find((post) => post._id === expandedId) ?? null,
    [expandedId, posts]
  );

  // Navigate to next/previous whisper
  const navigateWhisper = useCallback((direction: 'next' | 'prev' | 'random') => {
    if (!expandedId || posts.length <= 1) return;

    const currentIndex = posts.findIndex(p => p._id === expandedId);
    let newPost;

    if (direction === 'random') {
      const availablePosts = posts.filter(p => p._id !== expandedId);
      if (availablePosts.length > 0) {
        newPost = availablePosts[Math.floor(Math.random() * availablePosts.length)];
      } else {
        return;
      }
    } else if (direction === 'next') {
      const newIndex = (currentIndex + 1) % posts.length;
      newPost = posts[newIndex];
    } else {
      const newIndex = currentIndex - 1 < 0 ? posts.length - 1 : currentIndex - 1;
      newPost = posts[newIndex];
    }

    // Set slide direction for animation
    setSlideDirection(direction === 'prev' ? 'right' : 'left');

    // After animation completes, update the whisper
    setTimeout(() => {
      setExpandedId(newPost._id);
      setSlideDirection(null);
    }, 400);
  }, [expandedId, posts]);

  // Auto-rotate whispers when modal is open
  useEffect(() => {
    if (!expandedId || posts.length <= 1) return;

    // Use 5s in development, 30s in production
    const interval = process.env.NODE_ENV === 'development' ? 5000 : 30000;
    const updateInterval = 50; // Update progress every 50ms

    setTimerProgress(0);

    const progressTimer = setInterval(() => {
      setTimerProgress(prev => {
        const next = prev + (updateInterval / interval) * 100;
        if (next >= 100) {
          navigateWhisper('random');
          return 0;
        }
        return next;
      });
    }, updateInterval);

    return () => {
      clearInterval(progressTimer);
      setTimerProgress(0);
    };
  }, [expandedId, posts, navigateWhisper]);

  useEffect(() => {
    if (expandedWhisper) {
      document.body.classList.add('whisper-expanded');
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setExpandedId(null);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          navigateWhisper('prev');
        } else if (event.key === 'ArrowRight' || event.key === ' ') {
          event.preventDefault();
          navigateWhisper('next');
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.classList.remove('whisper-expanded');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    document.body.classList.remove('whisper-expanded');
    document.body.style.overflow = '';
    return undefined;
  }, [expandedWhisper, navigateWhisper]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const displayTitle = 'Whispers';

  if (loading || !settingsLoaded) {
    return (
      <div className="page-center" style={{ background: '#121a30', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <BackgroundProvider backgroundTheme={settings?.backgroundTheme} backgroundTint={settings?.backgroundTint || 'none'}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Landing Hero */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="container animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'var(--text-tertiary)',
                fontSize: '0.75rem',
                margin: 0,
                position: 'absolute',
                right: 0,
                top: '-5px',
                whiteSpace: 'nowrap',
              }}>
                A Cloud Of
              </p>
              <h1 style={{
                fontSize: '3.5rem',
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-title)',
                fontWeight: 400,
                margin: 0,
                display: 'inline-block',
              }}>
                Whispers
              </h1>
            </div>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '36rem',
              margin: '0 auto',
            }}>
              Share your thoughts, ideas, and moments of clarity.
              No likes, no algorithms, no endless scrolling—just real voices in a calm space.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href={isAuthenticated ? `/@${currentUser?.username || ''}` : '/register'} className="btn btn-primary" style={{ minWidth: '10rem' }}>
              {isAuthenticated ? "Let's relax" : 'Create Account'}
            </Link>
            {!isAuthenticated && (
              <Link href="/login" className="btn btn-outline" style={{ minWidth: '10rem' }}>
                Login
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '32rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Write · Discover · Connect
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              Not another feed to scroll. Just a calm place where thoughts can rest and be found by those who wander by.
            </p>
          </div>
        </div>
      </main>

      {expandedWhisper && (
        <>
          <div
            className="whisper-modal-overlay"
            onClick={() => setExpandedId(null)}
          />

          <div
            className={`whisper-modal-container ${slideDirection ? `slide-${slideDirection}` : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <WhisperCard
              key={expandedWhisper._id}
              whisper={{
                id: expandedWhisper._id,
                content: expandedWhisper.content,
                date: expandedWhisper.date,
                icon: expandedWhisper.icon,
                color: expandedWhisper.color,
                formattedDate: formatDate(expandedWhisper.date),
                siteName: displayTitle,
                authorName: expandedWhisper.author?.displayName ?? displayTitle,
              }}
              showAuthor={true}
            />
          </div>

          {/* Navigation Controls - Outside modal container */}
          <div className="modal-controls">
            <button
              className="modal-nav-btn modal-nav-prev"
              onClick={() => navigateWhisper('prev')}
              aria-label="Previous whisper"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="modal-timer-container">
              <svg className="modal-timer" width="36" height="36" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  strokeDashoffset={`${2 * Math.PI * 15 * (1 - timerProgress / 100)}`}
                  transform="rotate(-90 18 18)"
                  style={{ transition: 'stroke-dashoffset 50ms linear' }}
                />
              </svg>
            </div>

            <button
              className="modal-nav-btn modal-nav-next"
              onClick={() => navigateWhisper('next')}
              aria-label="Next whisper"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Close button - Outside modal container */}
          <button
            className="modal-close-btn"
            onClick={() => {
              setExpandedId(null);
            }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </>
      )}

        </div>
      </BackgroundProvider>

      {/* Compose Button - only for authenticated users on landing */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
