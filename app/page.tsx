'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import WhisperCard from '@/components/whispers/WhisperCard';
import { DEFAULT_ICON_COLOR, isValidIconColor, type IconColorName } from '@/lib/whispers';
import { BackgroundProvider } from '@/components/BackgroundProvider';

interface Post {
  _id: string;
  content: string;
  date: string;
  icon?: string | null;
  color?: IconColorName;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [timerProgress, setTimerProgress] = useState(0);

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

  const hasNoPosts = posts.length === 0;
  const displayTitle = settings?.title || 'My Whispers';

  if (loading || !settingsLoaded) {
    return (
      <div className="page-center" style={{ background: '#0a0e1a', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <BackgroundProvider backgroundTheme={settings?.backgroundTheme} backgroundTint={settings?.backgroundTint || 'none'}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ paddingTop: '4rem', paddingBottom: '4rem' }} className="animate-fade-up">
        <div className="container">
          <div className="page-header">
            {settings?.asciiArt && (
              <pre style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                lineHeight: '1.2',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                opacity: 0.7,
              }}>
                {settings.asciiArt}
              </pre>
            )}
            <p style={{
              fontFamily: 'var(--font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-tertiary)',
              marginBottom: 0,
              fontSize: '0.8rem',
            }}>
              Whispers from
            </p>
            <h1>{displayTitle}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        <div className="container animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {hasNoPosts ? (
            <div className="text-center">
              <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
                No whispers yet in the quiet hours...
              </p>
              {!isAuthenticated && (
                <Link href="/setup" className="btn btn-primary">
                  Begin Your Journey
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {posts.map((post) => (
                <WhisperCard
                  key={post._id}
                  whisper={{
                    id: post._id,
                    content: post.content,
                    date: post.date,
                    icon: post.icon,
                    color: post.color,
                    formattedDate: formatDate(post.date),
                    siteName: displayTitle,
                  }}
                  onCardClick={() => {
                    setExpandedId(post._id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '2.25rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div className="container text-center animate-fade-up">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgba(210, 214, 239, 0.42)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Link href="/midnight-whisper" style={{ color: 'inherit' }}>
                Midnight Whispers
              </Link>
              <span style={{ opacity: 0.6 }}>·</span>
              <a
                href="https://github.com/jordymeow/midnight-whisper"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit' }}
              >
                GitHub
              </a>
              {isAuthenticated && (
                <>
                  <span style={{ opacity: 0.6 }}>·</span>
                  <Link href="/admin" style={{ color: 'inherit' }}>
                    Admin
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </footer>
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
                authorName: displayTitle,
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
  );
}
