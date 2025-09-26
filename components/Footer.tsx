import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function Footer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('midnight-auth')?.value ?? '';
  const viewer = token ? verifyToken(token) : null;
  const isAuthenticated = !!viewer;
  const isAdmin = viewer?.role === 'admin';

  return (
    <footer style={{ padding: '2.25rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
      <div className="container text-center animate-fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'rgba(210, 214, 239, 0.42)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link href="/" style={{ color: 'inherit' }}>
              Home
            </Link>
            {isAdmin && (
              <>
                <span style={{ opacity: 0.6 }}>·</span>
                <Link href="/dashboard" style={{ color: 'inherit' }}>
                  Dashboard
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <span style={{ opacity: 0.6 }}>·</span>
                <Link href={`/@${viewer.username}`} style={{ color: 'inherit' }}>
                  Profile
                </Link>
                <span style={{ opacity: 0.6 }}>·</span>
                <Link href="/search" style={{ color: 'inherit' }}>
                  Search
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}