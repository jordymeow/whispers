'use client';

import { useState, useMemo } from 'react';
import { icons } from 'lucide-react';
import {
  DEFAULT_ICON_COLOR,
  ICON_COLORS,
  type IconColorName,
  getIconColorStyles,
} from '@/lib/whispers';

interface Post {
  _id: string;
  content: string;
  date: string;
  icon?: string | null;
  color?: IconColorName;
  isDraft?: boolean;
}

interface ComposeFormProps {
  editingPost?: Post | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

type IconName = keyof typeof icons;

// Curated icon categories for better organization
const ICON_CATEGORIES = {
  'Night & Dreams': ['Moon', 'MoonStar', 'Stars', 'Sparkles', 'Star', 'CloudMoon', 'Zap'],
  'Weather & Nature': ['Cloud', 'CloudRain', 'CloudSnow', 'Sun', 'Wind', 'Snowflake', 'Trees', 'Tree', 'Leaf', 'Flower', 'Cherry'],
  'Emotions': ['Heart', 'HeartHandshake', 'Smile', 'Frown', 'Laugh', 'Angry'],
  'Time': ['Clock', 'Timer', 'Watch', 'Hourglass', 'Calendar', 'CalendarDays'],
  'Abstract': ['Circle', 'Square', 'Triangle', 'Hexagon', 'Octagon', 'Diamond'],
} as const;

export function ComposeForm({ editingPost, onSuccess, onCancel, showToast }: ComposeFormProps) {
  const [content, setContent] = useState(editingPost?.content || '');
  const [postDate, setPostDate] = useState(() => {
    if (editingPost) {
      const dt = new Date(editingPost.date);
      return isNaN(dt.getTime())
        ? new Date().toISOString().split('T')[0]
        : dt.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(editingPost?.icon ?? null);
  const [selectedColor, setSelectedColor] = useState<IconColorName>(
    editingPost?.color || DEFAULT_ICON_COLOR
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPreset = useMemo(() => getIconColorStyles(selectedColor), [selectedColor]);

  const iconSearchResults = useMemo(() => {
    if (!iconSearch) return [];
    const searchTerm = iconSearch.toLowerCase();
    return Object.keys(icons).filter(name =>
      name.toLowerCase().includes(searchTerm)
    ).slice(0, 20);
  }, [iconSearch]);

  const filteredIcons = useMemo(() => {
    if (iconSearch) return iconSearchResults;
    return Object.entries(ICON_CATEGORIES).flatMap(([_, iconNames]) => iconNames);
  }, [iconSearch, iconSearchResults]);

  const renderIcon = (name?: string | null, props?: { size?: number; strokeWidth?: number }) => {
    if (!name) return null;
    const IconComponent = icons[name as IconName];
    if (!IconComponent) return null;
    return <IconComponent size={props?.size ?? 20} strokeWidth={props?.strokeWidth ?? 1.6} />;
  };

  const handleSavePost = async (e: React.FormEvent, isDraft: boolean = false) => {
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

      if (editingPost) {
        const res = await fetch(`/api/posts/${editingPost._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update whisper');
        }

        if (showToast) {
          showToast(editingPost.isDraft && !isDraft ? 'Published' : 'Updated', 'success');
        }
      } else {
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

        if (showToast) {
          showToast(isDraft ? 'Saved as draft' : 'Published', 'success');
        }
      }

      // Reset form if not editing
      if (!editingPost) {
        setContent('');
        setSelectedIcon(null);
        setSelectedColor(DEFAULT_ICON_COLOR);
        setPostDate(new Date().toISOString().split('T')[0]);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3 className="settings-section">
        {editingPost ? 'Edit Whisper' : 'New Whisper'}
      </h3>

      {editingPost && (
        <div
          className="message"
          style={{
            marginBottom: '1rem',
            fontSize: '0.85rem',
            background: 'rgba(124, 124, 240, 0.1)',
            border: '1px solid rgba(124, 124, 240, 0.3)',
          }}
        >
          Editing whisper from {new Date(editingPost.date).toLocaleDateString()}
        </div>
      )}

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

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="btn-outline"
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {selectedIcon ? (
                <>
                  {renderIcon(selectedIcon)}
                  <span style={{ marginLeft: '0.5rem' }}>{selectedIcon}</span>
                </>
              ) : (
                'Choose Icon'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedIcon(null);
                setShowIconPicker(false);
              }}
              className="btn-outline"
              disabled={loading || !selectedIcon}
              style={{ opacity: selectedIcon ? 1 : 0.5 }}
            >
              Clear
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {ICON_COLORS.map(({ name, iconColor, iconBorder }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedColor(name)}
                disabled={loading}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: iconColor,
                  border: `2px solid ${iconBorder}`,
                  cursor: 'pointer',
                  opacity: selectedColor === name ? 1 : 0.6,
                  transform: selectedColor === name ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
                aria-label={`Select ${name} color`}
              />
            ))}
          </div>

          {showIconPicker && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                border: `1px solid ${selectedPreset.iconBorder}`,
                borderRadius: '0.75rem',
                background: selectedPreset.iconBg,
              }}
            >
              <input
                type="text"
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                style={{
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                }}
              />

              {!iconSearch && (
                <>
                  {Object.entries(ICON_CATEGORIES).map(([category, iconNames]) => (
                    <div key={category} style={{ marginBottom: '1rem' }}>
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
                </>
              )}

              {iconSearch && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))',
                  gap: '0.5rem',
                }}>
                  {filteredIcons.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                      No icons found matching "{iconSearch}"
                    </p>
                  ) : (
                    filteredIcons.map((iconName) => (
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
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {!selectedIcon && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
              No icon selected – the MoonStar icon will be used.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row' }}>
          {editingPost ? (
            <>
              <button
                type="button"
                className="btn-outline"
                onClick={onCancel}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-soft"
                style={{ flex: 1 }}
                disabled={loading || !content.trim()}
              >
                {loading ? 'Updating…' : (editingPost.isDraft ? 'Publish' : 'Update')}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-outline"
                onClick={(e) => handleSavePost(e as any, true)}
                disabled={loading || !content.trim()}
                style={{ flex: 1 }}
              >
                {loading ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                type="submit"
                className="btn-soft"
                style={{ flex: 1 }}
                disabled={loading || !content.trim()}
              >
                {loading ? 'Publishing…' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </form>
    </>
  );
}