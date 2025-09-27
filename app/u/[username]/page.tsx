import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { BackgroundProvider } from '@/components/BackgroundProvider';
import { ProfileHeader } from '@/components/ProfileHeader';
import ProfileFeed from '@/components/whispers/ProfileFeed';
import type { WhisperCardData } from '@/components/whispers/WhisperCard';
import { DEFAULT_ICON_COLOR, isValidIconColor } from '@/lib/whispers';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';
import { DEFAULT_BACKGROUND_THEME, DEFAULT_BACKGROUND_TINT } from '@/lib/backgroundThemes';
import { verifyToken } from '@/lib/auth';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  await connectToDatabase();
  const userDoc = await User.findOne({ username: username.toLowerCase() }).lean();

  if (!userDoc) {
    return {
      title: 'Profile Not Found | Whispers',
    };
  }

  return {
    title: `${userDoc.displayName} | Whispers`,
    description: `Whispers from ${userDoc.displayName}`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = rawUsername.toLowerCase();
  await connectToDatabase();

  const userDoc = await User.findOne({ username }).lean();
  if (!userDoc) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('midnight-auth')?.value ?? '';
  const viewer = token ? verifyToken(token) : null;
  const canCompose = viewer?.username === userDoc.username;

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
        <ProfileHeader
          asciiArt={asciiArt}
          displayName={userDoc.displayName}
          showWhispersFrom={true}
        />

        <main style={{ flex: 1, paddingBottom: '4rem', paddingTop: '1.5rem' }}>
          <ProfileFeed
            posts={posts}
            ownerName={userDoc.displayName}
            ownerUsername={userDoc.username}
            siteName="Whispers"
            canCompose={canCompose}
          />
        </main>
      </div>
    </BackgroundProvider>
  );
}