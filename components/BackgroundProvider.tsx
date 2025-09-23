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
    none: { r: 10, g: 14, b: 26 }, // Default dark blue
    purple: { r: 25, g: 10, b: 35 },
    blue: { r: 10, g: 20, b: 40 },
    cyan: { r: 10, g: 30, b: 35 },
    green: { r: 10, g: 25, b: 15 },
    amber: { r: 35, g: 25, b: 10 }, // More orange
    yellow: { r: 40, g: 35, b: 10 }, // Bright yellow
    red: { r: 30, g: 10, b: 10 },
    pink: { r: 30, g: 10, b: 25 },
    indigo: { r: 15, g: 10, b: 35 },
  };

  useEffect(() => {
    const themeKey = backgroundTheme || 'cosmic_dust';
    const theme = BACKGROUND_THEMES[themeKey as keyof typeof BACKGROUND_THEMES];

    if (!theme) {
      // Set a default dark background if theme not found
      document.body.style.background = 'hsl(220, 40%, 8%)';
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

    if (theme.size) {
      document.body.style.backgroundSize = theme.size;
    } else {
      document.body.style.backgroundSize = 'cover';
    }

    if (theme.overlay) {
      document.body.style.backgroundImage = `${theme.overlay}, ${theme.style}`;
    }

    // Apply animation if present
    if ('animation' in theme && theme.animation) {
      document.body.style.animation = theme.animation;
    } else {
      document.body.style.animation = '';
    }

    // Cleanup - restore dark background
    return () => {
      document.body.style.background = '#0a0e1a'; // Default dark background from globals.css
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