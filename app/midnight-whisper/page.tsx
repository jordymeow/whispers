import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whispers',
  description:
    'Whispers is a quiet format for personal late-night reflections—just one author, one voice, and a constellation of linked minds.',
};

const sections = [
  {
    title: 'A Single Voice, Written at Night',
    body: `Whispers is a deliberately small kind of website. There is only one author, one
thought-stream, no timelines competing for attention. It is made for the ideas that surface when the
house finally goes quiet—the sentences that tend to evaporate by morning if they are not written
down.`,
  },
  {
    title: 'No Feeds, No Comments, No Noise',
    body: `You post when you have something to say, not because a notification nudges you. Visitors read
at the pace of a breath; there are no comment threads to moderate, no likes to count, no scrolling
war. Whispers turns publishing into a nightly ritual rather than a performance.`,
  },
  {
    title: 'A Constellation of Minds',
    body: `Every whisper can point to another site built the same way, forming a loose, hand-picked
constellation. Wander from page to page and you are moving through people the author admires—peeking
into their quiet reflections, not their carefully-managed personas. The network grows organically,
without feeds or algorithms.`,
  },
  {
    title: 'Back to the Soul of Writing',
    body: `It is not a journal, not a travelogue, not a productivity hack. It is the simplest interface
between a moment of clarity and the page. Whispers invites you to return, night after night,
and leave a trace of what the world felt like from the inside.`,
  },
];

export default function AboutMidnightWhisperPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '6rem 0' }}>
        <div className="container" style={{ maxWidth: '48rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <header className="animate-fade-up" style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Whispers
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              A calm format for sharing the ideas that visit in the quiet hours.
            </p>
          </header>

          <div className="animate-fade-up" style={{ animationDelay: '40ms' }}>
            {sections.map(({ title, body }) => (
              <article key={title} className="card" style={{ background: 'rgba(20, 22, 30, 0.82)', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{body}</p>
              </article>
            ))}
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '80ms', textAlign: 'center' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '9999px',
                border: '1px solid rgba(158, 160, 255, 0.35)',
                color: 'var(--text-secondary)',
              }}
            >
              ← Return home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
