import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function Footer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('midnight-auth')?.value ?? '';
  const viewer = token ? verifyToken(token) : null;
  const isAdmin = viewer?.role === 'admin';

  const siteTitle = 'Whispers';

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
              {siteTitle}
            </Link>
            <span style={{ opacity: 0.6 }}>·</span>
            <a
              href="https://github.com/jordymeow/midnight-whisper"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit' }}
            >
              GitHub
            </a>
            {isAdmin && (
              <>
                <span style={{ opacity: 0.6 }}>·</span>
                <Link href="/admin" style={{ color: 'inherit' }}>
                  Admin
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
