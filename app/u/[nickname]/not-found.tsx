import Link from 'next/link';
import { BackgroundProvider } from '@/components/BackgroundProvider';

export default function UserNotFound() {
  return (
    <BackgroundProvider>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '36rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-title)', fontWeight: 400 }}>Whisper Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            That storyteller hasn&apos;t left any trace in the cloud yet—or maybe the link was whispered incorrectly. Try searching again or head back to the main hall.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-outline">
              ← Return to Whispers
            </Link>
            <Link href="/register" className="btn btn-primary">
              Create Your Profile
            </Link>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}
