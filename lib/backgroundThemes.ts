export const BACKGROUND_THEMES = {
  // Gradients & Atmospheres
  cosmic_dust: {
    name: 'Cosmic Dust',
    style: 'radial-gradient(ellipse at center, rgba(26, 31, 54, 0.6) 0%, transparent 70%)',
  },
  northern_lights: {
    name: 'Northern Lights',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },
  deep_ocean: {
    name: 'Deep Ocean',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },

  // Animated Patterns
  starfield: {
    name: 'Starfield',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },
  fireflies: {
    name: 'Fireflies',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },
  constellation: {
    name: 'Constellation',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },

  // Static Patterns
  grid: {
    name: 'Grid',
    style: 'linear-gradient(rgba(255,255,255,.03) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.03) 1.5px, transparent 1.5px)',
    size: '40px 40px',
  },
  hexagon: {
    name: 'Hexagon',
    style: 'linear-gradient(30deg, #0a0e1a 12%, transparent 12.5%, transparent 87%, #0a0e1a 87.5%, #0a0e1a), linear-gradient(150deg, #0a0e1a 12%, transparent 12.5%, transparent 87%, #0a0e1a 87.5%, #0a0e1a), linear-gradient(30deg, #0a0e1a 12%, transparent 12.5%, transparent 87%, #0a0e1a 87.5%, #0a0e1a), linear-gradient(150deg, #0a0e1a 12%, transparent 12.5%, transparent 87%, #0a0e1a 87.5%, #0a0e1a), linear-gradient(60deg, #0f1420 25%, transparent 25.5%, transparent 75%, #0f1420 75%, #0f1420), linear-gradient(60deg, #0f1420 25%, transparent 25.5%, transparent 75%, #0f1420 75%, #0f1420)',
    size: '80px 140px',
  },
  ocean_waves: {
    name: 'Ocean Waves',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },
  vertical_lines: {
    name: 'Vertical Lines',
    style: 'repeating-linear-gradient(90deg, #0a0e1a, #0a0e1a 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 31px)',
  },
  diamond: {
    name: 'Diamond',
    style: 'linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%), linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%)',
    size: '60px 60px',
  },
  crosshatch: {
    name: 'Crosshatch',
    style: 'linear-gradient(45deg, transparent 0%, transparent 40%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.02) 60%, transparent 60%, transparent 100%), linear-gradient(-45deg, transparent 0%, transparent 40%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.02) 60%, transparent 60%, transparent 100%)',
    size: '30px 30px',
  },

  // Textured & Organic
  static_noise: {
    name: 'Static Noise',
    style: '#0a0e1a', // Simple dark background, effects handled by JS
  },
  woven: {
    name: 'Woven',
    style: 'linear-gradient(90deg, rgba(255,255,255,0.03) 50%, transparent 50%), linear-gradient(rgba(255,255,255,0.03) 50%, transparent 50%)',
    size: '20px 20px',
  },
  carbon_fiber: {
    name: 'Carbon Fiber',
    style: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
    size: '100% 100%',
  },
  midnight_rain: {
    name: 'Midnight Rain',
    style: '#0a0e1a', // Simple dark background, rain is handled by JS
  },
} as const;

export type BackgroundThemeKey = keyof typeof BACKGROUND_THEMES;
export const DEFAULT_BACKGROUND_THEME: BackgroundThemeKey = 'cosmic_dust';

// CSS animations that need to be added to global styles
export const BACKGROUND_ANIMATIONS = `
@keyframes drift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -200px -200px;
  }
}

@keyframes shootingStars {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -800px 800px;
  }
}

@keyframes fireflies {
  0%, 100% {
    background-position: 0 0;
  }
  25% {
    background-position: -100px 50px;
  }
  50% {
    background-position: -150px -50px;
  }
  75% {
    background-position: -50px 100px;
  }
}

@keyframes northernLights {
  0%, 100% {
    background-position: 0% 50%;
    background-size: 200% 200%;
  }
  50% {
    background-position: 100% 50%;
    background-size: 200% 200%;
  }
}

@keyframes rain {
  from {
    background-position: 0 0, 0 0, 0 0;
  }
  to {
    background-position: 0 100px, 0 100px, 0 100px;
  }
}

@keyframes rainFall {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 100px;
  }
}

@keyframes waves {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 100% 100%;
  }
}
`;