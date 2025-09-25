import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import ProfileFeed from '@/components/whispers/ProfileFeed';
import type { WhisperCardData } from '@/components/whispers/WhisperCard';
import { DEFAULT_ICON_COLOR, isValidIconColor } from '@/lib/whispers';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';
import { DEFAULT_BACKGROUND_THEME, DEFAULT_BACKGROUND_TINT } from '@/lib/backgroundThemes';
import { verifyToken } from '@/lib/auth';

export const revalidate = 0;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ nickname: string }>;
}) {
  const { nickname: rawNickname } = await params;
  const nickname = rawNickname.toLowerCase();
  await connectToDatabase();

  const userDoc = await User.findOne({ nickname }).lean();
  if (!userDoc) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('midnight-auth')?.value ?? '';
  const viewer = token ? verifyToken(token) : null;
  const canCompose = viewer?.nickname === userDoc.nickname;

  const postsDocs = await Post.find({
    userId: userDoc._id,
    $or: [{ isDraft: false }, { isDraft: { $exists: false } }],
  })
    .sort({ date: -1 })
    .lean();

  const posts: WhisperCardData[] = postsDocs.map((post) => {
    const isoDate = (post.date instanceof Date ? post.date : new Date(post.date)).toISOString();
    return {
      id: post._id.toString(),
      content: post.content,
      date: isoDate,
      formattedDate: new Date(isoDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      icon:
        typeof post.icon === 'string' && post.icon.trim().length > 0
          ? post.icon.trim()
          : null,
      color: isValidIconColor(post.color) ? post.color : DEFAULT_ICON_COLOR,
    };
  });

  const asciiArt =
    typeof userDoc.asciiArtBanner === 'string' && userDoc.asciiArtBanner.trim().length > 0
      ? userDoc.asciiArtBanner
      : DEFAULT_ASCII_ART_BANNER;

  const backgroundTheme = userDoc.backgroundTheme || DEFAULT_BACKGROUND_THEME;
  const backgroundTint = userDoc.backgroundTint || DEFAULT_BACKGROUND_TINT;

  return (
    <BackgroundProvider backgroundTheme={backgroundTheme} backgroundTint={backgroundTint}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '5rem 0 3rem' }} className="animate-fade-up">
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {asciiArt.trim().length > 0 && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <pre
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    lineHeight: '1.2',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                    opacity: 0.7,
                    margin: 0,
                    display: 'inline-block',
                  }}
                >
                  {asciiArt}
                </pre>
              </div>
            )}
            <p style={{
              fontFamily: 'var(--font-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-tertiary)',
              margin: 0,
              fontSize: '0.75rem',
            }}>
              Whispers from
            </p>
            <h1
              style={{
                fontSize: '36px',
                fontFamily: 'var(--font-title)',
                fontWeight: 400,
                margin: 0,
              }}
            >
              {userDoc.displayName}
            </h1>
          </div>
        </header>

        <main style={{ flex: 1, paddingBottom: '4rem', paddingTop: '1.5rem' }}>
          <ProfileFeed
            posts={posts}
            ownerName={userDoc.displayName}
            ownerNickname={userDoc.nickname}
            siteName="Whispers"
            canCompose={canCompose}
          />
        </main>
      </div>
    </BackgroundProvider>
  );
}
