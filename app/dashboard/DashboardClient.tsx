'use client';

import { ReactNode, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import { EmailChangeModal } from '@/components/EmailChangeModal';
import { ProfileHeader } from '@/components/ProfileHeader';
import {
  icons,
  type LucideIcon,
  Search,
  X,
} from 'lucide-react';
import WhisperCard from '@/components/whispers/WhisperCard';
import {
  ICON_COLORS,
  DEFAULT_ICON_COLOR,
  IconColorName,
  isValidIconColor,
  getIconColorStyles,
} from '@/lib/whispers';
import {
  BACKGROUND_THEMES,
  BACKGROUND_TINTS,
  DEFAULT_BACKGROUND_THEME,
  DEFAULT_BACKGROUND_TINT,
  type BackgroundThemeKey,
  type BackgroundTint,
} from '@/lib/backgroundThemes';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import { ADMIN_ICON_CATEGORIES, ICON_SYNONYMS } from '@/lib/whisperIcons';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';

const RainEffect = lazy(() => import('@/components/RainEffect').then(m => ({ default: m.RainEffect })));

interface PostAuthor {
  displayName: string;
  username: string;
}

interface Post {
  _id: string;
  content: string;
  date: string;
  icon?: string | null;
  color?: IconColorName;
  isDraft?: boolean;
  author?: PostAuthor | null;
}

interface CurrentUser {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  role: 'admin' | 'user';
  backgroundTheme: BackgroundThemeKey;
  backgroundTint: BackgroundTint;
  asciiArtBanner: string;
}

interface AdminStatsUserSummary {
  username: string;
  displayName: string;
  email?: string;
  emailVerified?: boolean;
  createdAt: string;
  postCount?: number;
}

interface AdminStats {
  totalUsers: number;
  topActive: AdminStatsUserSummary[];
  recentUsers: AdminStatsUserSummary[];
}

// Shared flex layout so paired admin actions stay aligned.
const ButtonRow = ({ children, gap }: { children: ReactNode; gap?: string }) => (
  <div className="admin-button-row" style={gap ? { gap } : undefined}>
    {children}
  </div>
);

function normalizeCurrentUser(user: any): CurrentUser {
  const theme =
    typeof user.backgroundTheme === 'string' && user.backgroundTheme in BACKGROUND_THEMES
      ? (user.backgroundTheme as BackgroundThemeKey)
      : DEFAULT_BACKGROUND_THEME;

  const tint =
    typeof user.backgroundTint === 'string' && BACKGROUND_TINTS.includes(user.backgroundTint as BackgroundTint)
      ? (user.backgroundTint as BackgroundTint)
      : DEFAULT_BACKGROUND_TINT;

  const banner =
    typeof user.asciiArtBanner === 'string' && user.asciiArtBanner.trim().length > 0
      ? user.asciiArtBanner
      : DEFAULT_ASCII_ART_BANNER;

  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    bio: user.bio ?? '',
    role: user.role,
    backgroundTheme: theme,
    backgroundTint: tint,
    asciiArtBanner: banner,
  };
}

// Removed header and whisper themes - keeping it simple

const ADMIN_FONT_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const ADMIN_BASE_FONT_SIZE = '0.95rem';

type IconName = keyof typeof icons;

export default function DashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [newPost, setNewPost] = useState('');
  // Initialize with today's date in YYYY-MM-DD format
  const [postDate, setPostDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as 'drafts' | 'published' | 'compose' | 'profile' | 'admin';
  const activeTab = tabFromUrl || 'compose';

  // Redirect to compose tab if no tab is specified
  useEffect(() => {
    if (!tabFromUrl && pathname === '/dashboard') {
      router.replace('/dashboard?tab=compose');
    }
  }, [tabFromUrl, pathname, router]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Settings form
  const [asciiArt, setAsciiArt] = useState(DEFAULT_ASCII_ART_BANNER);
  const [trackingSnippet, setTrackingSnippet] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<BackgroundThemeKey>(DEFAULT_BACKGROUND_THEME);
  const [backgroundTint, setBackgroundTint] = useState<BackgroundTint>(DEFAULT_BACKGROUND_TINT);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<IconColorName>(DEFAULT_ICON_COLOR);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const selectedPreset = useMemo(() => getIconColorStyles(selectedColor), [selectedColor]);

  // Color tint options for background - matching the actual background colors
  const COLOR_TINTS: Array<{ value: BackgroundTint; label: string; color: string }> = [
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
  }, [iconEntries]);

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

  // Navigation tabs are now handled in the VerticalNav component

  // Navigation is now handled by VerticalNav component

  const normalisePost = (post: any): Post => ({
    _id: post._id,
    content: post.content,
    date: post.date,
    icon: typeof post.icon === 'string' && post.icon.length ? post.icon : null,
    color: isValidIconColor(post.color) ? (post.color as IconColorName) : DEFAULT_ICON_COLOR,
    isDraft: post.isDraft || false,
    author: post.author
      ? {
          displayName: post.author.displayName ?? 'Unknown Whisperer',
          username: post.author.username ?? '',
        }
      : null,
  });

  const canModifyPost = (post: Post) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return post.author?.username === currentUser.username;
  };

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
    document.title = 'Dashboard | Whispers';
    const initialise = async () => {
      resetComposer();
      const authed = await checkAuth();
      if (!authed) return;
      const profile = await fetchCurrentUser();
      await fetchPosts();
      await fetchAnalytics();
    };

    initialise().finally(() => setInitialLoading(false));
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login');
        return false;
      }
      return true;
    } catch (error) {
      router.push('/login');
      return false;
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/settings', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingSnippet(typeof data.trackingSnippet === 'string' ? data.trackingSnippet : '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAdminStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.user) {
        const profile = normalizeCurrentUser(data.user);
        setCurrentUser(profile);
        setProfileDisplayName(profile.displayName);
        setProfileUsername(profile.username);
        setProfileBio(profile.bio ?? '');
        setSelectedTheme(profile.backgroundTheme);
        setBackgroundTint(profile.backgroundTint);
        setAsciiArt(profile.asciiArtBanner);
        if (profile.role === 'admin') {
          fetchAdminStats();
        } else {
          setStats(null);
        }
        return profile;
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
    return null;
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?includeDrafts=true', {
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

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    setError('');
    setUsernameError(false);
    setProfileSaving(true);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          displayName: profileDisplayName,
          username: profileUsername,
          bio: profileBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        // Check if the error is about username
        if (data.error === 'Username already in use') {
          setUsernameError(true);
        }
        return;
      }

      if (data.user) {
        const updated = normalizeCurrentUser(data.user);
        setCurrentUser(updated);
        setProfileDisplayName(updated.displayName);
        setProfileUsername(updated.username);
        setProfileBio(updated.bio);
        setSelectedTheme(updated.backgroundTheme);
        setBackgroundTint(updated.backgroundTint);
        setAsciiArt(updated.asciiArtBanner);
      }

      setToast({ message: 'Profile updated', type: 'success' });
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePost = async (e: React.FormEvent | React.MouseEvent, isDraft: boolean = false) => {
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

        setToast({ message: editingPost.isDraft && !isDraft ? 'Published' : 'Updated', type: 'success' });
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

        setToast({ message: isDraft ? 'Saved as draft' : 'Published', type: 'success' });
      }

      resetComposer();
      fetchPosts();
      router.push(`/dashboard?tab=${isDraft ? 'drafts' : 'published'}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (post: Post) => {
    if (!canModifyPost(post)) return;
    setEditingPost(post);
    router.push('/dashboard?tab=compose');
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
    router.push('/dashboard?tab=published');
  };

  useEffect(() => {
    if (!editingPost) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetComposer();
        setError('');
        router.push('/dashboard?tab=published');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [editingPost]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this whisper?')) return;

    try {
      setDeletingId(id);
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
      } else {
        const data = await res.json().catch(() => null);
        const message = data?.error || 'Failed to delete whisper';
        setToast({ message, type: 'error' });
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      setToast({ message: 'Failed to delete whisper', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAppearanceSaving(true);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          backgroundTheme: selectedTheme,
          backgroundTint,
          asciiArtBanner: asciiArt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to update appearance');
        return;
      }

      if (data?.user) {
        const normalized = normalizeCurrentUser(data.user);
        setSelectedTheme(normalized.backgroundTheme);
        setBackgroundTint(normalized.backgroundTint);
        setAsciiArt(normalized.asciiArtBanner);
        setCurrentUser(normalized);
      }

      setToast({ message: 'Appearance updated', type: 'success' });
    } catch (error) {
      console.error('Appearance update error:', error);
      setError('Failed to update appearance');
    } finally {
      setAppearanceSaving(false);
    }
  };

  const handleUpdateAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      setError('Only administrators can update analytics');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trackingSnippet }),
      });

      if (res.ok) {
        setToast({ message: 'Analytics updated', type: 'success' });
        fetchAnalytics();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to update analytics');
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


  // Logout is now handled in the VerticalNav component

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setError('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
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

  if (initialLoading) {
    return (
      <div className="page-center" style={{ background: '#121a30', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Use selectedTheme and backgroundTint directly for immediate preview
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
      <ProfileHeader
        asciiArt={currentUser?.asciiArtBanner || `     *  .  *     .  *  .  *     *  .
  .  *  .   *.  *  .  *  .  *  .  *
    . *   WHISPERS FROM   * .  *
  *  .  *  .  *  .  *  .  *  .  *  .`}
        displayName={currentUser?.displayName || 'Dashboard'}
        subtitle={
          activeTab === 'compose' ? 'Compose' :
          activeTab === 'drafts' ? 'Drafts' :
          activeTab === 'published' ? 'Published' :
          activeTab === 'profile' ? 'Settings' :
          activeTab === 'admin' ? 'Admin' :
          undefined
        }
        showWhispersFrom={true}
      />

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Messages */}
          {error && <div className="message message-error">{error}</div>}

          {activeTab === 'compose' && (
            <div className="card mb-4 admin-tab-content">
              <h3 className="settings-section">
                {editingPost ? 'Edit Whisper' : 'New Whisper'}
              </h3>

              {error && <div className="message message-error">{error}</div>}

              <form onSubmit={(e) => handleSavePost(e, false)}>
                <div className="form-field">
                  <label htmlFor="post-content">Your whisper</label>
                  <textarea
                    id="post-content"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your thoughts in the quiet hours..."
                    disabled={loading}
                    rows={6}
                    style={{ resize: 'vertical', minHeight: '120px' }}
                  />
                  <div style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    color: newPost.length > 900 ? 'var(--error)' : 'var(--text-tertiary)'
                  }}>
                    {newPost.length} / 1000 characters
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

                {editingPost ? (
                  editingPost.isDraft ? (
                    <ButtonRow gap="1rem">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={(e) => handleSavePost(e, true)}
                        disabled={loading || !newPost.trim()}
                        style={{ opacity: !newPost.trim() ? 0.5 : 1 }}
                      >
                        {loading ? 'Saving…' : 'Save as Draft'}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-soft"
                        style={{ opacity: !newPost.trim() ? 0.5 : 1 }}
                        disabled={loading || !newPost.trim()}
                      >
                        {loading ? 'Publishing…' : 'Publish'}
                      </button>
                    </ButtonRow>
                  ) : (
                    <ButtonRow gap="1rem">
                      <button
                        type="submit"
                        className="btn btn-soft"
                        style={{ opacity: !newPost.trim() ? 0.5 : 1 }}
                        disabled={loading || !newPost.trim()}
                      >
                        {loading ? 'Updating…' : 'Update'}
                      </button>
                    </ButtonRow>
                  )
                ) : (
                  <ButtonRow gap="1rem">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={(e) => handleSavePost(e, true)}
                      disabled={loading || !newPost.trim()}
                      style={{ opacity: !newPost.trim() ? 0.5 : 1 }}
                    >
                      {loading ? 'Saving…' : 'Save as Draft'}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-soft"
                      style={{ opacity: !newPost.trim() ? 0.5 : 1 }}
                      disabled={loading || !newPost.trim()}
                    >
                      {loading ? 'Publishing…' : 'Publish'}
                    </button>
                  </ButtonRow>
                )}
              </form>
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="admin-tab-content">
              {posts.filter(p => p.isDraft).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No drafts yet...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {posts.filter(p => p.isDraft).map((post) => (
                    <WhisperCard
                      key={post._id}
                      whisper={{
                        id: post._id,
                        content: post.content,
                        date: post.date,
                        icon: post.icon,
                        color: post.color,
                        formattedDate: formatDate(post.date),
                        authorName: post.author?.displayName,
                      }}
                      highlight={editingPost?._id === post._id}
                      showAuthor={Boolean(post.author)}
                      actions={(
                        <ButtonRow>
                          <button
                            onClick={() => handleStartEdit(post)}
                            className="btn"
                            disabled={!canModifyPost(post) || deletingId === post._id}
                            style={{
                              background: 'rgba(158, 160, 255, 0.2)',
                              border: '1px solid rgba(158, 160, 255, 0.5)',
                              color: 'rgba(210, 214, 239, 0.95)',
                              fontSize: '0.875rem',
                              padding: '0.6rem 1.2rem',
                              fontWeight: 500,
                              borderRadius: '0.5rem',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="btn"
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              color: 'rgb(255, 180, 180)',
                              fontSize: '0.875rem',
                              padding: '0.6rem 1.2rem',
                              fontWeight: 500,
                              borderRadius: '0.5rem',
                            }}
                            disabled={!canModifyPost(post) || deletingId === post._id}
                            aria-busy={deletingId === post._id}
                          >
                            {deletingId === post._id ? 'Deleting…' : 'Delete'}
                          </button>
                        </ButtonRow>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'published' && (
            <div className="admin-tab-content">
              {posts.filter(p => !p.isDraft).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No published whispers yet...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {posts.filter(p => !p.isDraft).map((post) => (
                    <WhisperCard
                      key={post._id}
                      whisper={{
                        id: post._id,
                        content: post.content,
                        date: post.date,
                        icon: post.icon,
                        color: post.color,
                        formattedDate: formatDate(post.date),
                        authorName: post.author?.displayName,
                      }}
                      highlight={editingPost?._id === post._id}
                      showAuthor={Boolean(post.author)}
                      actions={(
                        <ButtonRow>
                          <button
                            onClick={() => handleStartEdit(post)}
                            className="btn"
                            disabled={!canModifyPost(post) || loading || deletingId === post._id}
                            style={{
                              background: 'rgba(158, 160, 255, 0.2)',
                              border: '1px solid rgba(158, 160, 255, 0.5)',
                              color: 'rgba(210, 214, 239, 0.95)',
                              fontSize: '0.875rem',
                              padding: '0.6rem 1.2rem',
                              fontWeight: 500,
                              borderRadius: '0.5rem',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="btn"
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              color: 'rgb(255, 180, 180)',
                              fontSize: '0.875rem',
                              padding: '0.6rem 1.2rem',
                              fontWeight: 500,
                              borderRadius: '0.5rem',
                            }}
                            disabled={!canModifyPost(post) || loading || deletingId === post._id}
                            aria-busy={deletingId === post._id}
                          >
                            {deletingId === post._id ? 'Deleting…' : 'Delete'}
                          </button>
                        </ButtonRow>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="admin-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card">
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 className="settings-section">Identity</h3>
                    <div className="form-field">
                      <label htmlFor="displayName">Display name</label>
                      <input
                        id="displayName"
                        type="text"
                        value={profileDisplayName}
                        onChange={(e) => setProfileDisplayName(e.target.value)}
                        disabled={profileSaving}
                        maxLength={64}
                      />
                    </div>
                    <div className="form-field" style={{ marginBottom: '0.75rem' }}>
                      <label htmlFor="username">Username</label>
                      <input
                        id="username"
                        type="text"
                        value={profileUsername}
                        onChange={(e) => {
                          setProfileUsername(e.target.value);
                          setUsernameError(false);
                        }}
                        disabled={profileSaving}
                        maxLength={64}
                        style={{
                          borderColor: usernameError ? 'var(--error)' : undefined,
                        }}
                      />
                      {usernameError && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--error)', marginTop: '0.5rem' }}>
                          Username already in use
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        Profile URL: <code>/@{profileUsername || currentUser?.username || 'username'}</code>
                      </p>
                    </div>

                    <div className="form-field" style={{ marginBottom: '0.75rem' }}>
                      <label>Email</label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(24, 27, 40, 0.5)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(158, 160, 255, 0.15)'
                      }}>
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                          {currentUser?.email || 'Loading...'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}
                          onClick={() => setShowEmailChangeModal(true)}
                        >
                          Modify
                        </button>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        Email changes require verification
                      </p>
                    </div>
                  </div>

                    <div className="form-field" style={{ marginTop: '0.25rem' }}>
                      <label htmlFor="profileBio">Bio</label>
                    <textarea
                      id="profileBio"
                      rows={4}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value.slice(0, 280))}
                      placeholder="Share something about yourself (max 280 characters)"
                      disabled={profileSaving}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                      {profileBio.length} / 280 characters
                    </p>
                  </div>

                  <ButtonRow>
                    {currentUser && (
                      <Link
                        href={`/@${currentUser.username}`}
                        className="btn btn-outline"
                      >
                        View Public Profile
                      </Link>
                    )}
                    <button type="submit" className="btn btn-soft" disabled={profileSaving}>
                      {profileSaving ? 'Saving…' : 'Save Profile'}
                    </button>
                  </ButtonRow>
                </form>
              </div>

              <div className="card">
                <form onSubmit={handleUpdateAppearance} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 className="settings-section">Appearance</h3>
                    <div className="form-field">
                      <label htmlFor="theme">Theme</label>
                      <select
                        id="theme"
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value as BackgroundThemeKey)}
                        disabled={appearanceSaving}
                      >
                        {Object.entries(BACKGROUND_THEMES).map(([key, preset]) => (
                          <option key={key} value={key}>
                            {preset.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Color tint</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
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
                            disabled={appearanceSaving}
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
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        {backgroundTint === 'none'
                          ? 'No color tint applied'
                          : `${COLOR_TINTS.find(t => t.value === backgroundTint)?.label} tint applied`}
                      </p>
                    </div>

                    <div className="form-field">
                      <label htmlFor="asciiArt">ASCII Art Banner</label>
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
                        placeholder="Add ASCII art (max 10 lines)"
                        disabled={appearanceSaving}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre',
                        }}
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                        {asciiArt.split('\n').length}/10 lines used
                      </p>
                    </div>
                  </div>

                  <ButtonRow>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme(DEFAULT_BACKGROUND_THEME);
                        setBackgroundTint(DEFAULT_BACKGROUND_TINT);
                        setAsciiArt(DEFAULT_ASCII_ART_BANNER);
                      }}
                      className="btn btn-outline"
                      disabled={appearanceSaving}
                    >
                      Reset Appearance
                    </button>
                    <button type="submit" className="btn btn-soft" disabled={appearanceSaving}>
                      {appearanceSaving ? 'Saving…' : 'Save Appearance'}
                    </button>
                  </ButtonRow>
                </form>
              </div>

              <div className="card" style={{ borderColor: 'rgba(255, 100, 100, 0.3)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 className="settings-section" style={{ color: 'rgb(255, 120, 120)' }}>Danger Zone</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                      These actions are permanent and cannot be undone.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 100, 100, 0.08)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 100, 100, 0.2)'
                      }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Delete Account</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          Permanently delete your account, all your whispers, and associated data. This action cannot be undone.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(true)}
                          className="btn"
                          style={{
                            background: 'rgba(255, 100, 100, 0.15)',
                            border: '1px solid rgba(255, 100, 100, 0.4)',
                            color: 'rgb(255, 150, 150)'
                          }}
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            currentUser?.role === 'admin' ? (
              <div className="admin-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="settings-section" style={{ marginBottom: 0 }}>Community snapshot</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {statsLoading ? 'Refreshing…' : 'Live overview'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>Total members</p>
                      <p style={{ fontSize: '2rem', margin: 0 }}>
                        {statsLoading && !stats ? '—' : stats?.totalUsers ?? '—'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 220px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>Top voices (whispers)</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {(stats?.topActive ?? []).map((user) => (
                          <li key={`active-${user.username}`}>
                            <Link href={`/@${user.username}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                              <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                              <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>@{user.username}</span>
                            </Link>
                            <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.35rem', fontSize: '0.8rem' }}>
                              {user.postCount ?? 0} whispers
                            </span>
                          </li>
                        ))}
                        {(!stats || (stats.topActive?.length ?? 0) === 0) && (
                          <li style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {statsLoading ? 'Loading…' : 'No activity yet'}
                          </li>
                        )}
                      </ul>
                    </div>

                    <div style={{ flex: '1 1 320px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>Newest arrivals</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {(stats?.recentUsers ?? []).map((user) => (
                          <li key={`recent-${user.username}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <Link href={`/@${user.username}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                              <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                              <span style={{ color: 'var(--text-tertiary)', marginLeft: '0.4rem' }}>@{user.username}</span>
                            </Link>
                            {user.email && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {user.email}
                                {!user.emailVerified && (
                                  <span style={{
                                    color: 'var(--warning)',
                                    fontSize: '0.7rem',
                                    background: 'rgba(255, 200, 0, 0.1)',
                                    padding: '0.1rem 0.3rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid rgba(255, 200, 0, 0.3)'
                                  }}>
                                    Unverified
                                  </span>
                                )}
                              </span>
                            )}
                            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem' }}>
                              Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </li>
                        ))}
                        {(!stats || (stats.recentUsers?.length ?? 0) === 0) && (
                          <li style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {statsLoading ? 'Loading…' : 'No signups yet'}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <form onSubmit={handleUpdateAnalytics} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <h3 className="settings-section">Analytics</h3>
                      <div className="form-field">
                        <label htmlFor="trackingSnippet">Analytics snippet</label>
                        <textarea
                          id="trackingSnippet"
                          value={trackingSnippet}
                          onChange={(e) => setTrackingSnippet(e.target.value)}
                          rows={6}
                          placeholder="Paste your analytics or tracking script here"
                          style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                          disabled={loading}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                          Script is injected before {'</body>'}. Ideal for Google Analytics, Plausible, and friends.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button type="submit" className="btn btn-soft" disabled={loading}>
                        {loading ? 'Saving…' : 'Save Analytics'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card">
                <p style={{ color: 'var(--text-secondary)' }}>
                  Only administrators can access analytics settings.
                </p>
              </div>
            )
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
                  className="btn btn-outline"
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
                  {Object.entries(ADMIN_ICON_CATEGORIES).map(([category, iconNames]) => (
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
                                key={`${category}-${name}`}
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
      {currentUser && (
        <EmailChangeModal
          isOpen={showEmailChangeModal}
          currentEmail={currentUser.email}
          onClose={() => setShowEmailChangeModal(false)}
          onSuccess={async (newEmail) => {
            // Update the current user state with new email
            setCurrentUser({ ...currentUser, email: newEmail });
            setToast({ message: 'Email updated successfully', type: 'success' });

            // Reload user data to get updated JWT token info
            try {
              const res = await fetch('/api/users/me', { credentials: 'include' });
              if (res.ok) {
                const data = await res.json();
                if (data.user) {
                  setCurrentUser(normalizeCurrentUser(data.user));
                }
              }
            } catch (err) {
              console.error('Failed to reload user data:', err);
            }
          }}
        />
      )}

      {showDeleteModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword('');
              setError('');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <div
            className="modal-container"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(20, 22, 30, 0.98)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '24rem',
              zIndex: 1001,
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: 'rgb(255, 120, 120)' }}>Delete Account</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This will permanently delete:
            </p>
            <ul style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
              <li>Your account and profile</li>
              <li>All your whispers</li>
              <li>Your settings and preferences</li>
            </ul>
            <p style={{ color: 'rgb(255, 150, 150)', marginBottom: '1.5rem', fontWeight: 500 }}>
              This action cannot be undone.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
            >
              <div className="form-field">
                <label htmlFor="delete-password">Enter your password to confirm</label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={deleteLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setError('');
                  }}
                  className="btn btn-outline"
                  disabled={deleteLoading}
                  style={{ flex: 1 }}
                >Cancel</button>
                <button
                  type="submit"
                  className="btn"
                  disabled={deleteLoading || !deletePassword}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 100, 100, 0.2)',
                    border: '1px solid rgba(255, 100, 100, 0.5)',
                    color: 'rgb(255, 180, 180)',
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </BackgroundProvider>
  );
}
