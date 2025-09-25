import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import SearchClient from './SearchClient';
import type { Metadata } from 'next';

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

  const user = verifyToken(token);
  if (!user) {
    redirect('/login');
  }

  return <SearchClient />;
}