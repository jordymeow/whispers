interface ProfileHeaderProps {
  asciiArt?: string;
  displayName: string;
  username?: string;
  showWhispersFrom?: boolean;
  subtitle?: string;
}

export function ProfileHeader({
  asciiArt,
  displayName,
  username,
  showWhispersFrom = true,
  subtitle
}: ProfileHeaderProps) {
  return (
    <header style={{ padding: '5rem 0 3rem' }} className="animate-fade-up">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {asciiArt && asciiArt.trim().length > 0 && (
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
        {showWhispersFrom && (
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
        )}
        <h1
          style={{
            fontSize: '36px',
            fontFamily: 'var(--font-title)',
            fontWeight: 400,
            margin: 0,
          }}
        >
          {displayName}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            marginTop: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {subtitle}
          </p>
        )}
        {username && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            marginTop: '0.5rem',
          }}>
            @{username}
          </p>
        )}
      </div>
    </header>
  );
}