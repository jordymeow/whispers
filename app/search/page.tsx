import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import SearchClient from './SearchClient';
import type { Metadata } from 'next';
import { DEFAULT_BACKGROUND_THEME, DEFAULT_BACKGROUND_TINT } from '@/lib/backgroundThemes';

export const metadata: Metadata = {
  title: 'Search Users | Whispers',
  description: 'Discover and connect with other users',
};

export default async function SearchPage() {
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('midnight-auth')?.value;

  if (!token) {
    redirect('/login');
  }

  const viewer = verifyToken(token);
  if (!viewer) {
    redirect('/login');
  }

  // Fetch user's theme preferences
  await connectToDatabase();
  const userDoc = await User.findById(viewer.userId).lean();

  const backgroundTheme = userDoc?.backgroundTheme || DEFAULT_BACKGROUND_THEME;
  const backgroundTint = userDoc?.backgroundTint || DEFAULT_BACKGROUND_TINT;

  return <SearchClient backgroundTheme={backgroundTheme} backgroundTint={backgroundTint} />;
}