'use client';

import { BackgroundProvider } from '@/components/BackgroundProvider';

const fontOptions = [
  { name: 'IBM Plex Mono', family: '"IBM Plex Mono", monospace' },
  { name: 'Space Grotesk', family: '"Space Grotesk", sans-serif' },
  { name: 'Inter', family: '"Inter", sans-serif' },
  { name: 'Spectral', family: '"Spectral", serif' },
  { name: 'Cormorant Garamond', family: '"Cormorant Garamond", serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
  { name: 'System UI', family: 'system-ui, -apple-system, sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { name: 'Courier New', family: '"Courier New", Courier, monospace' },
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
  { name: 'Lucida Console', family: '"Lucida Console", Monaco, monospace' },
  { name: 'Palatino', family: 'Palatino, "Palatino Linotype", serif' },
  { name: 'Garamond', family: 'Garamond, serif' },
  { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive' },
  { name: 'Impact', family: 'Impact, fantasy' },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif' },
];

export default function FontDemo() {
  return (
    <BackgroundProvider backgroundTheme="cosmic_dust" backgroundTint="none">
      <div style={{ minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '3rem', textAlign: 'center' }}>Font Demo Page</h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            {fontOptions.map((font, index) => (
              <div
                key={index}
                style={{
                  padding: '2rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{
                  marginBottom: '0.5rem',
                  fontSize: '0.75rem',
                  opacity: 0.6,
                  fontFamily: 'monospace'
                }}>
                  {index + 1}. {font.name}
                </div>

                <pre style={{
                  fontFamily: 'monospace',
                  fontSize: '0.6rem',
                  lineHeight: '1',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  opacity: 0.5,
                }}>
{` /\\_/\\
( o.o )
`}
                </pre>

                <p style={{
                  fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  fontSize: '0.7rem',
                }}>
                  Whispers from
                </p>

                <h2 style={{
                  fontFamily: font.family,
                  fontSize: '1.8rem',
                  fontWeight: '400',
                  letterSpacing: '0.02em',
                  marginBottom: '0'
                }}>
                  Jordy Meow
                </h2>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '1rem',
            marginTop: '3rem'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Current Settings</h2>
            <code style={{
              display: 'block',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '0.5rem'
            }}>
              --font-title: var(--font-body);<br/>
              --font-body: "IBM Plex Mono", "SFMono-Regular", monospace;
            </code>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}