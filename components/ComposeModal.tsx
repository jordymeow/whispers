'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, icons, Search } from 'lucide-react';
import {
  ICON_COLORS,
  DEFAULT_ICON_COLOR,
  type IconColorName,
  getIconColorStyles,
} from '@/lib/whispers';
import { BASIC_ICON_CATEGORIES } from '@/lib/whisperIcons';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: { isDraft: boolean }) => void;
}

type IconName = keyof typeof icons;

// Font settings for admin consistency
const ADMIN_FONT_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const ADMIN_BASE_FONT_SIZE = '0.95rem';

export function ComposeModal({ isOpen, onClose, onSuccess }: ComposeModalProps) {
  const [content, setContent] = useState('');
  const [postDate, setPostDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<IconColorName>(DEFAULT_ICON_COLOR);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const selectedPreset = useMemo(() => getIconColorStyles(selectedColor), [selectedColor]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setPostDate(new Date().toISOString().split('T')[0]);
      setSelectedIcon(null);
      setSelectedColor(DEFAULT_ICON_COLOR);
      setShowIconPicker(false);
      setIconSearch('');
      setError('');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
      };
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !showIconPicker) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, showIconPicker, onClose]);

  const renderIcon = (name?: string | null, props?: { size?: number; strokeWidth?: number }) => {
    if (!name) return null;
    const IconComponent = icons[name as IconName];
    if (!IconComponent) return null;
    return <IconComponent size={props?.size ?? 20} strokeWidth={props?.strokeWidth ?? 1.6} />;
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return [];
    const searchTerm = iconSearch.toLowerCase();
    return Object.keys(icons).filter(name =>
      name.toLowerCase().includes(searchTerm)
    ).slice(0, 20);
  }, [iconSearch]);

  const handleSavePost = async (e: React.FormEvent | React.MouseEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        content: content.trim(),
        date: postDate ? new Date(postDate + 'T00:00:00').toISOString() : new Date().toISOString(),
        icon: selectedIcon,
        color: selectedColor,
        isDraft,
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create whisper');
      }

      // Reset form and close immediately
      setContent('');
      setSelectedIcon(null);
      setSelectedColor(DEFAULT_ICON_COLOR);
      setPostDate(new Date().toISOString().split('T')[0]);

      if (onSuccess) onSuccess({ isDraft });
      onClose();
    } catch (err: any) {
      setError(err.message);
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
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={onClose}
      />

      {/* Modal */}
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
          zIndex: 1001,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 'min(720px, 90vw)',
            maxHeight: '85vh',
            background: 'rgba(18, 20, 30, 0.95)',
            borderRadius: '1rem',
            border: '1px solid rgba(158, 160, 255, 0.3)',
            boxShadow: '0 28px 80px rgba(5, 6, 12, 0.55)',
            padding: '2rem',
            overflowY: 'auto',
            fontFamily: ADMIN_FONT_STACK,
            fontSize: ADMIN_BASE_FONT_SIZE,
            pointerEvents: 'auto',
            animation: 'modalGrow 0.3s ease',
            position: 'relative',
          }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
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
            transition: 'color 0.2s ease',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h3 className="settings-section">New Whisper</h3>

        {error && <div className="message message-error">{error}</div>}

        <form onSubmit={(e) => handleSavePost(e, false)}>
          <div className="form-field">
            <label htmlFor="post-content">Your whisper</label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts in the quiet hours..."
              disabled={loading}
              rows={6}
              style={{ resize: 'vertical', minHeight: '120px' }}
              autoFocus
            />
            <div style={{
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              color: content.length > 900 ? 'var(--error)' : 'var(--text-tertiary)'
            }}>
              {content.length} / 1000 characters
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="post-date">Date</label>
            <input
              id="post-date"
              type="date"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label>Icon & Color</label>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                disabled={loading}
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  background: selectedPreset.iconBg,
                  border: `2px solid ${selectedPreset.iconBorder}`,
                  color: selectedPreset.iconColor,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                aria-label="Select icon"
              >
                {renderIcon(selectedIcon || 'MoonStar', { size: 20, strokeWidth: 2 })}
              </button>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {ICON_COLORS.map(({ name, iconBg, iconBorder }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedColor(name)}
                    disabled={loading}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      background: iconBg,
                      border: `2px solid ${iconBorder}`,
                      cursor: 'pointer',
                      opacity: selectedColor === name ? 1 : 0.5,
                      transform: selectedColor === name ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                    aria-label={`Select ${name} color`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={(e) => handleSavePost(e, true)}
              disabled={loading || !content.trim()}
              style={{ flex: 1, opacity: !content.trim() ? 0.5 : 1 }}
            >
              {loading ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              className="btn-soft"
              style={{ flex: 1, opacity: !content.trim() ? 0.5 : 1 }}
              disabled={loading || !content.trim()}
            >
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Icon Picker Modal (nested modal) */}
      {showIconPicker && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 6, 10, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
          }}
          onClick={() => {
            setIconSearch('');
            setShowIconPicker(false);
          }}
        >
          <div
            style={{
              width: 'min(600px, 90vw)',
              maxHeight: '70vh',
              background: 'rgba(18, 20, 30, 0.95)',
              borderRadius: '1rem',
              border: '1px solid rgba(158, 160, 255, 0.3)',
              boxShadow: '0 28px 80px rgba(5, 6, 12, 0.55)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontFamily: ADMIN_FONT_STACK,
              fontSize: ADMIN_BASE_FONT_SIZE,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>Choose an Icon</h3>
              <button
                type="button"
                onClick={() => {
                  setIconSearch('');
                  setShowIconPicker(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  lineHeight: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(24, 27, 40, 0.75)',
                border: '1px solid rgba(158, 160, 255, 0.25)',
                borderRadius: '0.75rem',
                padding: '0.6rem 0.9rem',
              }}
            >
              <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              {iconSearch && (
                <button
                  type="button"
                  onClick={() => setIconSearch('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    lineHeight: 0,
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div
              style={{
                overflowY: 'auto',
                flex: 1,
                borderRadius: '0.75rem',
                background: 'rgba(14, 16, 26, 0.85)',
                border: '1px solid rgba(158, 160, 255, 0.2)',
                padding: '0.75rem',
              }}
            >
              {iconSearch ? (
                filteredIcons.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                    No icons found matching "{iconSearch}"
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))',
                      gap: '0.5rem',
                    }}
                  >
                    {filteredIcons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(iconName);
                          setShowIconPicker(false);
                          setIconSearch('');
                        }}
                        style={{
                          padding: '0.75rem',
                          background: selectedIcon === iconName ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          color: selectedPreset.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        title={iconName}
                      >
                        {renderIcon(iconName)}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(BASIC_ICON_CATEGORIES).map(([category, iconNames]) => (
                    <div key={category}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {category}
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))',
                        gap: '0.5rem',
                      }}>
                        {iconNames.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setSelectedIcon(iconName);
                              setShowIconPicker(false);
                              setIconSearch('');
                            }}
                            style={{
                              padding: '0.75rem',
                              background: selectedIcon === iconName ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              color: selectedPreset.iconColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title={iconName}
                          >
                            {renderIcon(iconName)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>,
    document.body
  );
}
