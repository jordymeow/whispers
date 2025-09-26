'use client';

import { useEffect, lazy, Suspense } from 'react';
import { BACKGROUND_THEMES } from '@/lib/backgroundThemes';

const RainEffect = lazy(() => import('@/components/RainEffect').then(m => ({ default: m.RainEffect })));
const BackgroundEffects = lazy(() => import('@/components/BackgroundEffects').then(m => ({ default: m.BackgroundEffects })));

// Themes that use JavaScript effects instead of CSS
const JS_EFFECT_THEMES = {
  'static_noise': 'static_noise',
  'ocean_waves': 'ocean_waves',
  'constellation': 'constellation',
  'fireflies': 'fireflies',
  'starfield': 'starfield',
  'deep_ocean': 'deep_ocean',
  'northern_lights': 'northern_lights',
} as const;

interface BackgroundProviderProps {
  backgroundTheme?: string;
  backgroundTint?: string;
  children?: React.ReactNode;
}

export function BackgroundProvider({ backgroundTheme, backgroundTint = 'none', children }: BackgroundProviderProps) {
  // Color tint definitions - RGB values to blend with background
  const TINT_COLORS: Record<string, { r: number; g: number; b: number }> = {
    none: { r: 24, g: 30, b: 48 },
    purple: { r: 44, g: 30, b: 64 },
    blue: { r: 28, g: 44, b: 74 },
    cyan: { r: 28, g: 60, b: 70 },
    green: { r: 26, g: 50, b: 32 },
    amber: { r: 62, g: 46, b: 18 },
    yellow: { r: 70, g: 60, b: 18 },
    red: { r: 58, g: 26, b: 26 },
    pink: { r: 60, g: 28, b: 48 },
    indigo: { r: 36, g: 28, b: 72 },
  };

  useEffect(() => {
    const themeKey = backgroundTheme || 'cosmic_dust';
    const theme = BACKGROUND_THEMES[themeKey as keyof typeof BACKGROUND_THEMES];

    if (!theme) {
      // Set a default dark background if theme not found
      document.body.style.background = 'hsl(220, 36%, 20%)';
      return;
    }

    // Get the tinted background color
    const tint = TINT_COLORS[backgroundTint] || TINT_COLORS.none;
    const baseColor = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;

    // Don't apply CSS styles for JS-powered themes
    if (themeKey in JS_EFFECT_THEMES) {
      // Simple solid color background for JS effects
      document.body.style.background = baseColor;
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.animation = '';
    } else {
      // Apply background theme with tinted base color
      if (theme.style.startsWith('#')) {
        // For solid color themes, just use the tinted color
        document.body.style.background = baseColor;
        document.body.style.backgroundImage = '';
      } else {
        // For gradient/pattern themes, set base color first, then layer the theme
        document.body.style.backgroundColor = baseColor;
        document.body.style.backgroundImage = theme.style;
      }
    }

    if ('size' in theme && theme.size) {
      document.body.style.backgroundSize = theme.size;
    } else {
      document.body.style.backgroundSize = 'cover';
    }

    if ('overlay' in theme && theme.overlay) {
      document.body.style.backgroundImage = `${theme.overlay}, ${theme.style}`;
    }

    // Clear any existing animation
    document.body.style.animation = '';

    // Cleanup - restore dark background
    return () => {
      document.body.style.background = '#121a30'; // Default background from globals.css
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.animation = '';
    };
  }, [backgroundTheme, backgroundTint]);

  const jsEffectType = backgroundTheme && backgroundTheme in JS_EFFECT_THEMES
    ? JS_EFFECT_THEMES[backgroundTheme as keyof typeof JS_EFFECT_THEMES]
    : null;

  return (
    <>
      {children}
      {backgroundTheme === 'midnight_rain' && (
        <Suspense fallback={null}>
          <RainEffect />
        </Suspense>
      )}
      {jsEffectType && (
        <Suspense fallback={null}>
          <BackgroundEffects type={jsEffectType} />
        </Suspense>
      )}
    </>
  );
}
