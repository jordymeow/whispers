'use client';

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import {
  icons,
  type LucideIcon,
  LogOut,
  Search,
  X,
  ExternalLink,
  PenSquare,
  ScrollText,
  Cog,
  Shield,
} from 'lucide-react';
import WhisperCard from '@/components/whispers/WhisperCard';
import {
  ICON_COLORS,
  DEFAULT_ICON_COLOR,
  IconColorName,
  isValidIconColor,
  getIconColorStyles,
} from '@/lib/whispers';
import { BACKGROUND_THEMES, DEFAULT_BACKGROUND_THEME, type BackgroundThemeKey } from '@/lib/backgroundThemes';
import { BackgroundProvider } from '@/components/BackgroundProvider';

const RainEffect = lazy(() => import('@/components/RainEffect').then(m => ({ default: m.RainEffect })));

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
  backgroundHue?: number;
  trackingSnippet?: string;
}

// Removed header and whisper themes - keeping it simple

const ADMIN_FONT_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const ADMIN_BASE_FONT_SIZE = '0.95rem';

type IconName = keyof typeof icons;

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newPost, setNewPost] = useState('');
  // Initialize with today's date in YYYY-MM-DD format
  const [postDate, setPostDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'whispers' | 'new' | 'profile' | 'admin'>('new');

  // Settings form
  const [editTitle, setEditTitle] = useState('My Whispers');
  const [asciiArt, setAsciiArt] = useState('');
  const [trackingSnippet, setTrackingSnippet] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<BackgroundThemeKey>(DEFAULT_BACKGROUND_THEME);
  const [backgroundTint, setBackgroundTint] = useState<string>('none');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<IconColorName>(DEFAULT_ICON_COLOR);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const selectedPreset = useMemo(() => getIconColorStyles(selectedColor), [selectedColor]);

  // Color tint options for background - matching the actual background colors
  const COLOR_TINTS = [
    { value: 'none', label: 'None', color: 'rgb(10, 14, 26)' },
    { value: 'purple', label: 'Purple', color: 'rgb(25, 10, 35)' },
    { value: 'blue', label: 'Blue', color: 'rgb(10, 20, 40)' },
    { value: 'cyan', label: 'Cyan', color: 'rgb(10, 30, 35)' },
    { value: 'green', label: 'Green', color: 'rgb(10, 25, 15)' },
    { value: 'amber', label: 'Amber', color: 'rgb(35, 25, 10)' },
    { value: 'yellow', label: 'Yellow', color: 'rgb(40, 35, 10)' },
    { value: 'red', label: 'Red', color: 'rgb(30, 10, 10)' },
    { value: 'pink', label: 'Pink', color: 'rgb(30, 10, 25)' },
    { value: 'indigo', label: 'Indigo', color: 'rgb(15, 10, 35)' },
  ];

  // Curated icon categories for better organization
  const ICON_CATEGORIES = useMemo(() => ({
    'Night & Dreams': ['Moon', 'MoonStar', 'Stars', 'Sparkles', 'Star', 'CloudMoon', 'Zap'],
    'Love & Emotions': ['Heart', 'HeartHandshake', 'HeartCrack', 'HeartPulse', 'Smile', 'Frown', 'Meh', 'Angry'],
    'Thinking & Mind': ['Brain', 'Lightbulb', 'BrainCircuit', 'BrainCog', 'Zap', 'CircuitBoard', 'Cpu', 'Binary'],
    'Life & Nature': ['Flower', 'Flower2', 'Trees', 'TreePalm', 'TreePine', 'Leaf', 'Sun', 'Sunrise', 'Sunset', 'Cloud', 'CloudRain', 'CloudSnow', 'Snowflake', 'Wind', 'Waves', 'Mountain', 'MountainSnow'],
    'Sports & Activity': ['Activity', 'Bike', 'PersonStanding', 'Medal', 'Trophy', 'Target', 'Dumbbell', 'Footprints', 'Award', 'Swords'],
    'Ideas & Creativity': ['Lightbulb', 'Palette', 'Brush', 'PenTool', 'Pencil', 'PenSquare', 'Feather', 'Wand2', 'Sparkle', 'Paintbrush'],
    'Technology': ['Laptop', 'Monitor', 'Smartphone', 'Tablet', 'Cpu', 'HardDrive', 'Wifi', 'Code', 'Terminal', 'Binary', 'Bug', 'GitBranch', 'Github', 'Globe', 'Database', 'Server'],
    'Music & Art': ['Music', 'Music2', 'Music3', 'Music4', 'Mic', 'Headphones', 'Radio', 'Volume2', 'Palette', 'Brush'],
    'Writing & Books': ['Book', 'BookOpen', 'Library', 'Newspaper', 'FileText', 'NotebookPen', 'NotebookText', 'ScrollText', 'Quote', 'PenSquare', 'Edit'],
    'Time & Calendar': ['Clock', 'Clock2', 'Clock3', 'Timer', 'Hourglass', 'Calendar', 'CalendarDays', 'Watch', 'AlarmClock', 'Stopwatch'],
    'Communication': ['MessageCircle', 'MessageSquare', 'Mail', 'Send', 'AtSign', 'Phone', 'Video', 'Users', 'UserPlus', 'Share2'],
    'Travel & Places': ['MapPin', 'Map', 'Compass', 'Navigation', 'Plane', 'Car', 'Ship', 'Train', 'Home', 'Building', 'Building2', 'Anchor'],
    'Food & Drink': ['Coffee', 'Beer', 'Wine', 'Pizza', 'Utensils', 'ChefHat', 'Cookie', 'Apple', 'Cherry'],
    'Weather': ['Cloud', 'CloudRain', 'CloudSnow', 'CloudLightning', 'CloudDrizzle', 'CloudFog', 'Umbrella', 'Thermometer'],
    'Celebration': ['PartyPopper', 'Gift', 'Cake', 'Sparkles', 'Star', 'Award', 'Crown'],
  }), []);

  const ICON_SYNONYMS: Partial<Record<IconName, string[]>> = useMemo(
    () => ({
      MoonStar: ['moon', 'night', 'dream', 'sleep', 'midnight', 'lunar', 'star'],
      Moon: ['night', 'dark', 'lunar', 'sleep'],
      Stars: ['constellation', 'night', 'sky'],
      Heart: ['love', 'favorite', 'care', 'emotion'],
      Brain: ['mind', 'think', 'thought', 'intelligence'],
      Lightbulb: ['idea', 'bright', 'innovation', 'eureka'],
      Flower: ['bloom', 'nature', 'garden', 'spring'],
      Sun: ['day', 'bright', 'warm', 'light'],
      Music: ['song', 'melody', 'audio', 'tune'],
      Book: ['story', 'novel', 'read', 'literature'],
      Clock: ['time', 'hour', 'minute', 'schedule'],
      MessageCircle: ['chat', 'message', 'talk', 'bubble', 'conversation'],
      PenSquare: ['edit', 'write', 'compose', 'draft', 'note'],
      Feather: ['poetry', 'write', 'quill', 'story'],
      Sparkles: ['shine', 'glimmer', 'twinkle', 'magic'],
      Camera: ['photo', 'picture', 'snapshot'],
      Sunrise: ['morning', 'dawn'],
      Sunset: ['evening', 'dusk'],
      CloudMoon: ['night', 'weather', 'dream'],
      Snowflake: ['cold', 'winter', 'snow'],
      Flame: ['fire', 'heat', 'passion', 'burn'],
      NotebookPen: ['journal', 'notes', 'write', 'log'],
      NotebookText: ['notes', 'pages', 'journal'],
      Quote: ['quote', 'speech', 'saying'],
      Bookmark: ['save', 'mark', 'favorite'],
      Timer: ['time', 'clock', 'alarm', 'countdown'],
    }),
    []
  );

  const iconEntries = useMemo(
    () =>
      (Object.entries(icons)
        .sort((a, b) => a[0].localeCompare(b[0])) as [IconName, LucideIcon][]),
    []
  );

  const iconIndex = useMemo(() => {
    const splitCamel = (name: string) =>
      name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    return iconEntries.map(([name, IconComponent]) => {
      const baseTokens = [name.toLowerCase(), ...splitCamel(name)];
      const synonymTokens = ICON_SYNONYMS[name] ?? [];
      const tokens = Array.from(new Set([...baseTokens, ...synonymTokens])).map((token) =>
        token.toLowerCase()
      );
      return { name, IconComponent, tokens };
    });
  }, [iconEntries, ICON_SYNONYMS]);

  const filteredIcons = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();
    if (!query) {
      return iconIndex.slice(0, 240);
    }
    return iconIndex
      .filter(({ tokens }) => tokens.some((token) => token.includes(query)))
      .slice(0, 240);
  }, [iconIndex, iconSearch]);

  const renderIcon = (name?: string | null, props?: { size?: number; strokeWidth?: number }) => {
    if (!name) return null;
    const IconComponent = icons[name as IconName];
    if (!IconComponent) return null;
    return <IconComponent size={props?.size ?? 20} strokeWidth={props?.strokeWidth ?? 1.6} />;
  };

const navigationTabs: Array<{ id: 'whispers' | 'new' | 'profile' | 'admin'; label: string; icon: LucideIcon }> = useMemo(
  () => [
    { id: 'new', label: 'Compose', icon: PenSquare },
    { id: 'whispers', label: 'Whispers', icon: ScrollText },
    { id: 'profile', label: 'Profile', icon: Cog },
  ],
  []
);

  const normalisePost = (post: any): Post => ({
    _id: post._id,
    content: post.content,
    date: post.date,
    icon: typeof post.icon === 'string' && post.icon.length ? post.icon : null,
    color: isValidIconColor(post.color) ? (post.color as IconColorName) : DEFAULT_ICON_COLOR,
  });

  const resetComposer = () => {
    setEditingPost(null);
    setNewPost('');
    const today = new Date().toISOString().split('T')[0];
    setPostDate(today);
    setSelectedIcon(null);
    setSelectedColor(DEFAULT_ICON_COLOR);
    setIconSearch('');
  };

  useEffect(() => {
    resetComposer();
    checkAuth();
    fetchPosts();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setEditTitle(data.title || 'My Whispers');
        setAsciiArt(data.asciiArt || '');
        setBackgroundTint(data.backgroundTint || 'none');
        // Check if the backgroundTheme is a valid key
        const savedBgTheme = data.backgroundTheme;
        if (savedBgTheme && savedBgTheme in BACKGROUND_THEMES) {
          setSelectedTheme(savedBgTheme as BackgroundThemeKey);
        } else {
          setSelectedTheme(DEFAULT_BACKGROUND_THEME);
        }
        setTrackingSnippet(typeof data.trackingSnippet === 'string' ? data.trackingSnippet : '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data.map(normalisePost) : []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPost.trim()) {
      setError('Please write something');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        content: newPost.trim(),
        date: postDate ? new Date(postDate + 'T00:00:00').toISOString() : new Date().toISOString(),
        icon: selectedIcon,
        color: selectedColor,
      };

      const wasEditing = Boolean(editingPost);

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

        setToast({ message: 'Whisper updated', type: 'success' });
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

        setToast({ message: 'Whisper sent', type: 'success' });
      }

      resetComposer();
      fetchPosts();
      if (wasEditing) {
        setActiveTab('whispers');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditingPost(post);
    setActiveTab('new');
    setNewPost(post.content);
    const dt = new Date(post.date);
    const dateIso = Number.isNaN(dt.getTime())
      ? new Date().toISOString().split('T')[0]
      : dt.toISOString().split('T')[0];
    setPostDate(dateIso);
    setSelectedIcon(post.icon ?? null);
    setSelectedColor(isValidIconColor(post.color) ? (post.color as IconColorName) : DEFAULT_ICON_COLOR);
    setIconSearch('');
    setError('');
  };

  const handleCancelEdit = () => {
    resetComposer();
    setError('');
    setActiveTab('whispers');
  };

  useEffect(() => {
    if (!editingPost) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetComposer();
        setError('');
        setActiveTab('whispers');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [editingPost]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this whisper?')) return;

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        if (editingPost && editingPost._id === id) {
          resetComposer();
        }
        setError('');
        setToast({ message: 'Whisper deleted', type: 'success' });
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: editTitle || 'My Whispers',
        backgroundTheme: selectedTheme,
        backgroundTint,
        asciiArt,
        trackingSnippet,
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSettings(updatedData);
        setToast({ message: 'Settings saved', type: 'success' });
      }
    } catch (error) {
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First fetch current settings to preserve them
      const currentRes = await fetch('/api/settings', {
        credentials: 'include',
        cache: 'no-store',
      });
      const currentSettings = currentRes.ok ? await currentRes.json() : {};

      // Update only analytics, preserving other settings
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...currentSettings,
          trackingSnippet,
        }),
      });

      if (res.ok) {
        setToast({ message: 'Analytics updated', type: 'success' });
        fetchSettings();
      }
    } catch (error) {
      setError('Failed to update analytics');
    } finally {
      setLoading(false);
    }
  };

  // Removed font theme useEffect - keeping it simple

  useEffect(() => {
    if (!showIconPicker) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowIconPicker(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIconPicker]);


  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <BackgroundProvider backgroundTheme={selectedTheme} backgroundTint={backgroundTint}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        fontFamily: ADMIN_FONT_STACK,
        fontSize: ADMIN_BASE_FONT_SIZE,
      }}
    >
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-title)', fontWeight: 400 }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                }}
              >
                {settings?.title || editTitle || 'My Whispers'}
              </Link>
            </h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <ExternalLink size={16} />
                View Site
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {navigationTabs.map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.6rem 0',
                    marginBottom: '-1px',
                    borderBottom: activeTab === id ? '2px solid var(--text-primary)' : '2px solid transparent',
                    color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    letterSpacing: '0.04em',
                    transition: 'color 0.2s ease, border-bottom 0.2s ease',
                  }}
                >
                  <TabIcon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.6rem 0',
                marginBottom: '-1px',
                borderBottom: activeTab === 'admin' ? '2px solid var(--text-primary)' : '2px solid transparent',
                color: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                letterSpacing: '0.04em',
                transition: 'color 0.2s ease, border-bottom 0.2s ease',
              }}
            >
              <Shield size={16} />
              Admin
            </button>
          </div>

          {/* Messages */}
          {error && <div className="message message-error">{error}</div>}

          {activeTab === 'new' && (
            <div className="card mb-4 admin-tab-content">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                {editingPost ? 'Edit Whisper' : 'New Whisper'}
              </h2>
              {editingPost && (
                <div
                  className="message"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(24, 27, 40, 0.65)',
                    border: '1px solid rgba(158, 160, 255, 0.35)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Editing whisper from {formatDate(editingPost.date)}
                </div>
              )}
              <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-field">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Write your whisper..."
                    maxLength={1000}
                    disabled={loading}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                    {newPost.length}/1000 characters
                  </p>
                </div>

                <div className="form-field">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-field">
                  <label>Icon</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(true)}
                      style={{
                        width: '3.1rem',
                        height: '3.1rem',
                        borderRadius: '1rem',
                        background: selectedPreset.iconBg,
                        border: `1px solid ${selectedPreset.iconBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedPreset.iconColor,
                        boxShadow: `0 18px 42px ${selectedPreset.iconBorder}`,
                        cursor: 'pointer',
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      }}
                    >
                      {renderIcon(selectedIcon ?? 'MoonStar', { size: 22 })}
                    </button>

                    <div style={{ display: 'inline-flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {ICON_COLORS.map(({ name, label, iconBg, iconBorder }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedColor(name)}
                          style={{
                            width: '1.8rem',
                            height: '1.8rem',
                            borderRadius: '0.65rem',
                            background: iconBg,
                            border: selectedColor === name
                              ? `2px solid ${iconBorder}`
                              : '1px solid rgba(158, 160, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.12s ease, border 0.12s ease',
                            transform: selectedColor === name ? 'scale(1.05)' : 'none',
                          }}
                          aria-label={`Select ${label}`}
                          title={label}
                        >
                          {renderIcon(selectedIcon ?? 'MoonStar', { size: 12 })}
                        </button>
                      ))}
                    </div>
                    {selectedIcon && (
                      <button
                        type="button"
                        onClick={() => setSelectedIcon(null)}
                        className="btn-outline"
                      >
                        <X size={14} />
                        Clear
                      </button>
                    )}
                  </div>
                  {!selectedIcon && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                      No icon selected – the MoonStar icon will be used.
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: editingPost ? 'space-between' : 'flex-end', gap: '0.75rem' }}>
                  {editingPost && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-soft" disabled={loading || !newPost.trim()}>
                    {loading ? (editingPost ? 'Updating…' : 'Whispering…') : editingPost ? 'Update Whisper' : 'Whisper'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'whispers' && (
            <div className="admin-tab-content">
              {posts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No whispers yet...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                      }}
                      highlight={editingPost?._id === post._id}
                      actions={(
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleStartEdit(post)}
                            className="btn-outline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="btn-outline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card admin-tab-content">
              <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <h3 className="settings-section">Identity</h3>
                  <div className="form-field">
                    <label htmlFor="title">Name</label>
                    <input
                      id="title"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="settings-section">Appearance</h3>

                  <div className="form-field">
                    <label htmlFor="theme">Theme</label>
                    <select
                      id="theme"
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value as BackgroundThemeKey)}
                      disabled={loading}
                    >
                      {Object.entries(BACKGROUND_THEMES).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      Color Tint
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap',
                    }}>
                      {COLOR_TINTS.map((tint) => (
                        <button
                          key={tint.value}
                          type="button"
                          onClick={() => setBackgroundTint(tint.value)}
                          style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '0.75rem',
                            border: backgroundTint === tint.value
                              ? '2px solid rgba(158, 160, 255, 0.8)'
                              : '1px solid rgba(158, 160, 255, 0.3)',
                            background: tint.color,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: backgroundTint === tint.value ? 'scale(1.1)' : 'scale(1)',
                            position: 'relative',
                          }}
                          title={tint.label}
                          disabled={loading}
                        >
                          {tint.value === 'none' && (
                            <span style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '0.65rem',
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontWeight: 600,
                            }}>
                              OFF
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      marginTop: '0.5rem',
                    }}>
                      {backgroundTint === 'none' ? 'No color tint applied' : `${COLOR_TINTS.find(t => t.value === backgroundTint)?.label} tint applied`}
                    </p>
                  </div>

                  <div className="form-field">
                    <label htmlFor="asciiArt">ASCII Art</label>
                    <textarea
                      id="asciiArt"
                      value={asciiArt}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        if (lines.length <= 10) {
                          setAsciiArt(e.target.value);
                        }
                      }}
                      rows={4}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        lineHeight: '1.2',
                        resize: 'vertical',
                        minHeight: '4em',
                        maxHeight: '10em'
                      }}
                      placeholder="Enter ASCII art (max 10 lines)"
                      disabled={loading}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', opacity: 0.7 }}>
                      Displayed at the top • Tip: Ask AI for "simple ASCII art of [subject], 5 lines max"
                    </p>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTheme('cosmic_dust');
                      setBackgroundTint('none');
                      setAsciiArt(' /\\_/\\ \n( o.o )');
                    }}
                    className="btn-soft"
                    disabled={loading}
                  >
                    Reset Appearance
                  </button>
                  <button type="submit" className="btn-soft" disabled={loading}>
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="card admin-tab-content">
              <form onSubmit={handleUpdateAnalytics} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <h3 className="settings-section">Analytics</h3>
                  <div className="form-field">
                    <label htmlFor="trackingSnippet">Analytics Snippet</label>
                    <textarea
                      id="trackingSnippet"
                      value={trackingSnippet}
                      onChange={(e) => setTrackingSnippet(e.target.value)}
                      placeholder="Paste optional analytics script (HTML/JS)"
                      rows={4}
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                      disabled={loading}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                      Added to every page before the closing body tag. Use for Google Analytics, Plausible, etc.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-soft" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

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
              alignItems: 'flex-start',
              padding: '6vh 1.5rem',
              zIndex: 50,
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIconSearch('');
                setShowIconPicker(false);
              }
            }}
          >
            <div
              style={{
                width: 'min(720px, 100%)',
                maxHeight: '80vh',
                background: 'rgba(18, 20, 30, 0.95)',
                borderRadius: '1rem',
                border: '1px solid rgba(158, 160, 255, 0.3)',
                boxShadow: '0 28px 80px rgba(5, 6, 12, 0.55)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>Choose an Icon</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIconSearch('');
                    setShowIconPicker(false);
                  }}
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
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

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIcon(null);
                    setIconSearch('');
                    setShowIconPicker(false);
                  }}
                  className="btn btn-ghost"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                  }}
                >
                  <X size={16} />
                  No Icon
                </button>
                {selectedIcon && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '9999px',
                      background: 'rgba(35, 38, 56, 0.65)',
                      border: '1px solid rgba(158, 160, 255, 0.3)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {renderIcon(selectedIcon, { size: 18 })}
                    {selectedIcon}
                  </div>
                )}
              </div>

              <div
                className="mw-scroll"
                style={{
                  overflowY: 'auto',
                  flex: 1,
                  borderRadius: '0.75rem',
                  background: 'rgba(14, 16, 26, 0.85)',
                  border: '1px solid rgba(158, 160, 255, 0.2)',
                  padding: '0.75rem',
                }}
              >
                {iconSearch.trim() ? (
                  // Search results
                  filteredIcons.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                      No icons match "{iconSearch}".
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                        gap: '0.6rem',
                      }}
                    >
                      {filteredIcons.map(({ name, IconComponent }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(name);
                            setIconSearch('');
                            setShowIconPicker(false);
                          }}
                          style={{
                            background: 'rgba(24, 27, 40, 0.55)',
                            border: selectedIcon === name
                              ? '1px solid rgba(177, 180, 255, 0.6)'
                              : '1px solid rgba(158, 160, 255, 0.18)',
                            borderRadius: '0.65rem',
                            padding: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.12s ease, border 0.12s ease, background 0.12s ease',
                            boxShadow: selectedIcon === name ? '0 12px 30px rgba(92, 116, 255, 0.22)' : 'none',
                          }}
                          aria-label={name}
                          title={name}
                        >
                          <IconComponent size={22} strokeWidth={1.6} />
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  // Categorized view
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {Object.entries(ICON_CATEGORIES).map(([category, iconNames]) => (
                      <div key={category}>
                        <h4 style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: '0.5rem',
                          opacity: 0.7,
                        }}>
                          {category}
                        </h4>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                            gap: '0.5rem',
                          }}
                        >
                          {iconNames.map((name) => {
                            const IconComponent = icons[name as IconName];
                            if (!IconComponent) return null;
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setSelectedIcon(name);
                                  setIconSearch('');
                                  setShowIconPicker(false);
                                }}
                                style={{
                                  background: 'rgba(24, 27, 40, 0.55)',
                                  border: selectedIcon === name
                                    ? '1px solid rgba(177, 180, 255, 0.6)'
                                    : '1px solid rgba(158, 160, 255, 0.18)',
                                  borderRadius: '0.5rem',
                                  padding: '0.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'transform 0.12s ease, border 0.12s ease, background 0.12s ease',
                                  boxShadow: selectedIcon === name ? '0 12px 30px rgba(92, 116, 255, 0.22)' : 'none',
                                }}
                                aria-label={name}
                                title={name}
                              >
                                <IconComponent size={20} strokeWidth={1.6} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      </div>
    </BackgroundProvider>
  );
}
