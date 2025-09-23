'use client';

import { ReactNode, useCallback, useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { icons } from 'lucide-react';
import { IconColorName, getIconColorStyles } from '@/lib/whispers';

export interface WhisperCardData {
  id?: string;
  content: string;
  date: string | Date;
  formattedDate?: string;
  icon?: string | null;
  color?: IconColorName | string | null;
  siteName?: string;
  authorName?: string;
}

interface WhisperCardProps {
  whisper: WhisperCardData;
  actions?: ReactNode;
  highlight?: boolean;
  showAuthor?: boolean;
  onCardClick?: (whisper: WhisperCardData) => void;
}

export function WhisperCard({
  whisper,
  actions,
  highlight = false,
  showAuthor = false,
  onCardClick,
}: WhisperCardProps) {
  const { content, formattedDate, date, icon, color, authorName } = whisper;

  const { iconBg, iconBorder, iconColor } = getIconColorStyles(color);
  const softGlow = iconBorder.includes('rgba')
    ? iconBorder.replace(/,\s*([0-9.]+)\)/, ', 0.28)')
    : iconBorder;

  const iconRenderer = useMemo(() => {
    const iconName = icon ?? 'MoonStar';
    const IconComponent = icons[iconName as keyof typeof icons] ?? icons.MoonStar;
    return <IconComponent size={24} strokeWidth={1.5} />;
  }, [icon]);

  const resolvedDate = useMemo(() => {
    if (formattedDate) return formattedDate;
    const dt = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [formattedDate, date]);

  const handleClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(whisper);
    }
  }, [onCardClick, whisper]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!onCardClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCardClick(whisper);
      }
    },
    [onCardClick, whisper]
  );

  const [isHovered, setIsHovered] = useState(false);

  const wrapperStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    cursor: onCardClick ? 'pointer' : 'default',
    outline: 'none',
    position: 'relative',
  };

  const innerWrapperStyles: CSSProperties = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'stretch',
  };

  const iconWrapperStyles: CSSProperties = {
    width: '3rem',
    height: '3rem',
    borderRadius: '1rem',
    background: iconBg,
    border: `1px solid ${iconBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: iconColor,
    marginTop: 'auto',
    marginBottom: 'auto',
    boxShadow: highlight
      ? `0 24px 52px ${softGlow}`
      : `0 14px 34px rgba(10, 12, 20, 0.35)`,
    '--whisper-icon-bg': iconBg,
    '--whisper-icon-border': iconBorder,
    '--whisper-icon-color': iconColor,
  } as CSSProperties;

  const articleStyles: CSSProperties = {
    flex: 1,
    border: isHovered && onCardClick
      ? `1px solid ${iconBorder}`
      : '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: highlight
      ? '0 32px 75px rgba(0, 0, 0, 0.7)'
      : '0 18px 45px rgba(0, 0, 0, 0.5)',
    padding: '2.25rem',
    borderRadius: '1.5rem',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease, transform 0.2s ease',
    '--whisper-border-color': iconBorder,
  } as CSSProperties;

  return (
    <div
      className="animate-fade-up whisper-card-complete"
      style={wrapperStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      aria-label={onCardClick ? `Open whisper from ${resolvedDate}` : undefined}
    >
      <div style={innerWrapperStyles}>
        <div style={iconWrapperStyles}>
          {iconRenderer}
        </div>
        <article
          className="whisper-post"
          style={articleStyles}
        >
          {/* Date header */}
          <div style={{
            marginBottom: '1.2rem',
            fontSize: '0.7rem',
            opacity: 0.4,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {resolvedDate}
          </div>
          <div className="whisper-content">
            {content}
            {showAuthor && authorName && (
              <div style={{
                marginTop: '1.8rem',
                textAlign: 'right',
                opacity: 0.5,
                fontSize: '0.9em'
              }}>
                — {authorName}
              </div>
            )}
          </div>
          {actions && (
            <div
              style={{ marginTop: '1.5rem' }}
              onClick={(event) => event.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

export default WhisperCard;
