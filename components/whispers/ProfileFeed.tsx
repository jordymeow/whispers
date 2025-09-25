'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import WhisperCard, { type WhisperCardData } from '@/components/whispers/WhisperCard';
import { ComposeModal } from '@/components/ComposeModal';

interface ProfileFeedProps {
  posts: WhisperCardData[];
  ownerName: string;
  siteName: string;
  ownerUsername: string;
  canCompose?: boolean;
}

type SlideDirection = 'left' | 'right' | null;
type NavigateDirection = 'next' | 'prev' | 'random';

const ROTATION_INTERVAL_DEV = 5000;
const ROTATION_INTERVAL_PROD = 30000;
const PROGRESS_UPDATE_MS = 50;

function formatDate(input: string | Date): string {
  const value = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(value.getTime())) {
    return '';
  }
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ProfileFeed({ posts, ownerName, siteName, ownerUsername, canCompose = false }: ProfileFeedProps) {
  const initialPosts = useMemo(
    () =>
      posts.map((post, index) => ({
        id: post.id ?? `${post.date}-${index}`,
        content: post.content,
        date: post.date,
        formattedDate: post.formattedDate ?? formatDate(post.date),
        icon: post.icon,
        color: post.color,
        siteName,
        authorName: ownerName,
      })),
    [posts, ownerName, siteName]
  );

  const [postList, setPostList] = useState<WhisperCardData[]>(initialPosts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [timerProgress, setTimerProgress] = useState(0);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    setPostList(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    setIsPortalReady(true);
    return () => setIsPortalReady(false);
  }, []);

  const expandedWhisper = useMemo(
    () => postList.find((post) => post.id === expandedId) ?? null,
    [expandedId, postList]
  );

  useEffect(() => {
    if (!expandedId) return;
    if (!postList.some((post) => post.id === expandedId)) {
      setExpandedId(null);
    }
  }, [expandedId, postList]);

  const closeModal = useCallback(() => {
    setExpandedId(null);
  }, []);

  const navigateWhisper = useCallback(
    (direction: NavigateDirection) => {
      if (!expandedId || postList.length <= 1) return;

      const currentIndex = postList.findIndex((post) => post.id === expandedId);
      if (currentIndex === -1) return;

      let target = postList[currentIndex];

      if (direction === 'random') {
        const pool = postList.filter((post) => post.id !== expandedId);
        if (pool.length === 0) return;
        target = pool[Math.floor(Math.random() * pool.length)];
      } else if (direction === 'next') {
        const nextIndex = (currentIndex + 1) % postList.length;
        target = postList[nextIndex];
      } else {
        const prevIndex = currentIndex - 1 < 0 ? postList.length - 1 : currentIndex - 1;
        target = postList[prevIndex];
      }

      if (!target?.id) return;

      const nextId = target.id;

      setSlideDirection(direction === 'prev' ? 'right' : 'left');

      setTimeout(() => {
        setExpandedId(nextId);
        setSlideDirection(null);
      }, 400);
    },
    [expandedId, postList]
  );

  useEffect(() => {
    if (!expandedId || postList.length <= 1) return undefined;

    const interval = process.env.NODE_ENV === 'development'
      ? ROTATION_INTERVAL_DEV
      : ROTATION_INTERVAL_PROD;

    setTimerProgress(0);

    const progressTimer = window.setInterval(() => {
      setTimerProgress((prev) => {
        const next = prev + (PROGRESS_UPDATE_MS / interval) * 100;
        if (next >= 100) {
          navigateWhisper('random');
          return 0;
        }
        return next;
      });
    }, PROGRESS_UPDATE_MS);

    return () => {
      window.clearInterval(progressTimer);
      setTimerProgress(0);
    };
  }, [expandedId, postList.length, navigateWhisper]);

  useEffect(() => {
    if (!expandedWhisper) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add('whisper-expanded');
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateWhisper('prev');
      } else if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        navigateWhisper('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('whisper-expanded');
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedWhisper, closeModal, navigateWhisper]);

  const handleCardSelect = useCallback((selected: WhisperCardData) => {
    if (selected.id) {
      setExpandedId(selected.id);
    }
  }, []);

  return (
    <>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {postList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              No whispers shared yet.
            </p>
            {canCompose && (
              <>
                <p style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.95rem',
                  maxWidth: '28rem',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Click the + button to whisper something new.
                  <br />
                  Visit your{' '}
                  <a
                    href="/dashboard"
                    style={{
                      color: 'var(--accent-bright)',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(158, 160, 255, 0.3)'
                    }}
                  >
                    dashboard
                  </a>
                  {' '}to personalize your page and manage your whispers.
                </p>
              </>
            )}
          </div>
        ) : (
          postList.map((post) => (
            <WhisperCard
              key={post.id}
              whisper={post}
              showAuthor={false}
              onCardClick={handleCardSelect}
            />
          ))
        )}
      </div>

      {isPortalReady && expandedWhisper && expandedWhisper.id &&
        createPortal(
          <>
            <div
              className="whisper-modal-overlay"
              onClick={closeModal}
            />

            <div
              className={`whisper-modal-container ${slideDirection ? `slide-${slideDirection}` : ''}`}
              onClick={(event) => event.stopPropagation()}
            >
              <WhisperCard
                key={expandedWhisper.id}
                whisper={expandedWhisper}
                showAuthor={true}
              />
            </div>

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
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.55)"
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

            <button
              className="modal-close-btn"
              onClick={closeModal}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </>,
          document.body
        )}

      {canCompose && !expandedId && (
        <button
          onClick={() => setShowCompose((prev) => !prev)}
          className="btn btn-soft"
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
          aria-label={showCompose ? 'Close compose modal' : 'Compose new whisper'}
        >
          {showCompose ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          )}
        </button>
      )}

      {canCompose && (
        <ComposeModal
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          onSuccess={async () => {
            try {
              const res = await fetch(`/api/posts?author=${encodeURIComponent(ownerUsername)}`, {
                cache: 'no-store',
                credentials: 'include',
              });
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                  const refreshed = data.map((post: any, index: number) => ({
                    id: post._id?.toString?.() ?? post._id ?? `${post.date}-${index}`,
                    content: post.content,
                    date: post.date,
                    formattedDate: post.formattedDate ?? formatDate(post.date),
                    icon: post.icon,
                    color: post.color,
                    siteName,
                    authorName: ownerName,
                  }));
                  setPostList(refreshed);
                }
              }
            } catch (error) {
              console.error('Failed to refresh posts after compose:', error);
            }
          }}
        />
      )}
    </>
  );
}

export default ProfileFeed;
