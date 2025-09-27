import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { VerticalNav } from './VerticalNav';
import { Suspense } from 'react';

export async function Navigation() {
  const cookieStore = await cookies();
  const token = cookieStore.get('midnight-auth')?.value ?? '';
  const viewer = token ? verifyToken(token) : null;
  const isAuthenticated = !!viewer;
  const isAdmin = viewer?.role === 'admin';

  return (
    <Suspense fallback={null}>
      <VerticalNav
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        username={viewer?.username}
      />
    </Suspense>
  );
}