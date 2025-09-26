'use client';

import { useEffect, useRef } from 'react';

interface EffectProps {
  type: string;
}

// Real constellation patterns
const CONSTELLATIONS = [
  { name: 'Orion', stars: [[0.3, 0.2], [0.35, 0.25], [0.4, 0.2], [0.35, 0.3], [0.3, 0.35], [0.4, 0.35], [0.35, 0.4], [0.35, 0.45]], lines: [[0,1], [1,2], [1,3], [3,4], [3,5], [3,6], [6,7]] },
  { name: 'Big Dipper', stars: [[0.5, 0.3], [0.55, 0.32], [0.6, 0.35], [0.65, 0.4], [0.7, 0.38], [0.72, 0.42], [0.68, 0.45]], lines: [[0,1], [1,2], [2,3], [3,4], [4,5], [3,6]] },
  { name: 'Cassiopeia', stars: [[0.2, 0.6], [0.25, 0.55], [0.3, 0.58], [0.35, 0.55], [0.4, 0.6]], lines: [[0,1], [1,2], [2,3], [3,4]] },
  { name: 'Leo', stars: [[0.6, 0.6], [0.65, 0.58], [0.7, 0.6], [0.68, 0.65], [0.65, 0.68], [0.6, 0.7], [0.55, 0.68], [0.52, 0.65], [0.55, 0.6]], lines: [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,0]] },
  { name: 'Scorpius', stars: [[0.7, 0.3], [0.72, 0.35], [0.74, 0.4], [0.76, 0.45], [0.78, 0.5], [0.75, 0.52], [0.72, 0.54], [0.7, 0.56], [0.68, 0.54]], lines: [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8]] },
];

export function BackgroundEffects({ type }: EffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;

    // Different effects based on type
    switch (type) {
      case 'static_noise': {
        // Large vibrating pixels like old CRT TV static
        const pixelSize = 20; // Large pixel blocks
        const cols = Math.ceil(canvas.width / pixelSize);
        const rows = Math.ceil(canvas.height / pixelSize);

        // Store pixel states for smooth vibration
        const pixels: { opacity: number; targetOpacity: number; speed: number }[][] = [];
        for (let i = 0; i < rows; i++) {
          pixels[i] = [];
          for (let j = 0; j < cols; j++) {
            pixels[i][j] = {
              opacity: Math.random(),
              targetOpacity: Math.random(),
              speed: Math.random() * 0.1 + 0.05
            };
          }
        }

        const animate = () => {
          // Clear canvas
          ctx.fillStyle = 'rgba(10, 14, 26, 1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw large vibrating pixels
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const pixel = pixels[row][col];

              // Smoothly vibrate opacity
              if (Math.abs(pixel.opacity - pixel.targetOpacity) < 0.01) {
                pixel.targetOpacity = Math.random();
                pixel.speed = Math.random() * 0.15 + 0.05;
              }

              // Move towards target opacity
              pixel.opacity += (pixel.targetOpacity - pixel.opacity) * pixel.speed;

              const x = col * pixelSize;
              const y = row * pixelSize;

              // Different types of static
              const rand = Math.random();
              if (rand < 0.7) {
                // Gray static (most common)
                const gray = Math.floor(Math.random() * 100 + 155);
                ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${pixel.opacity * 0.3})`;
              } else if (rand < 0.85) {
                // White static
                ctx.fillStyle = `rgba(255, 255, 255, ${pixel.opacity * 0.4})`;
              } else if (rand < 0.95) {
                // Green static (phosphor)
                ctx.fillStyle = `rgba(0, 255, 0, ${pixel.opacity * 0.3})`;
              } else {
                // Colored interference
                const r = Math.random() > 0.5 ? 255 : 0;
                const g = Math.random() > 0.5 ? 255 : 0;
                const b = Math.random() > 0.5 ? 255 : 0;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pixel.opacity * 0.2})`;
              }

              ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1); // -1 for grid effect
            }
          }

          // Horizontal interference lines
          for (let y = 0; y < canvas.height; y += 100) {
            if (Math.random() < 0.1) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
              ctx.lineWidth = Math.random() * 3 + 1;
              ctx.beginPath();
              ctx.moveTo(0, y + Math.random() * 20);
              ctx.lineTo(canvas.width, y + Math.random() * 20);
              ctx.stroke();
            }
          }

          // Occasional bright bands
          if (Math.random() < 0.02) {
            const bandY = Math.random() * canvas.height;
            const bandHeight = Math.random() * 50 + 20;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`;
            ctx.fillRect(0, bandY, canvas.width, bandHeight);
          }

          // CRT vignette effect
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8
          );
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      case 'ocean_waves': {
        let time = 0;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += 10) {
              const waveHeight = Math.sin((x * 0.01) + time) * 20 + Math.sin((x * 0.02) + time * 1.5) * 10;
              if (x === 0) {
                ctx.moveTo(x, y + waveHeight);
              } else {
                ctx.lineTo(x, y + waveHeight);
              }
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + (y / canvas.height) * 0.03})`;
            ctx.stroke();
          }

          time += 0.02;
          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      case 'constellation': {
        // Pick 2-3 random constellations
        const numConstellations = Math.floor(Math.random() * 2) + 2;
        const selectedConstellations: typeof CONSTELLATIONS[number][] = [];
        const usedIndices = new Set<number>();

        for (let i = 0; i < numConstellations && i < CONSTELLATIONS.length; i++) {
          let index;
          do {
            index = Math.floor(Math.random() * CONSTELLATIONS.length);
          } while (usedIndices.has(index));
          usedIndices.add(index);
          selectedConstellations.push(CONSTELLATIONS[index]);
        }

        // Generate random background stars once
        const backgroundStars: { x: number; y: number; size: number; brightness: number }[] = [];
        for (let i = 0; i < 100; i++) {
          backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            brightness: Math.random() * 0.3 + 0.1
          });
        }

        let rotation = 0;
        const animate = () => {
          // Clear and slowly rotate
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rotation);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);

          // Draw background stars (fixed positions)
          backgroundStars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.fill();
          });

          // Draw each constellation
          selectedConstellations.forEach((constellation, cIndex) => {
            // Offset each constellation slightly
            const offsetX = (cIndex % 2) * canvas.width * 0.5;
            const offsetY = Math.floor(cIndex / 2) * canvas.height * 0.5;

            // Scale and position stars
            const stars = constellation.stars.map(([x, y]) => [
              x * canvas.width * 0.5 + offsetX,
              y * canvas.height * 0.5 + offsetY
            ]);

            // Draw lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            constellation.lines.forEach(([start, end]) => {
              ctx.beginPath();
              ctx.moveTo(stars[start][0], stars[start][1]);
              ctx.lineTo(stars[end][0], stars[end][1]);
              ctx.stroke();
            });

            // Draw stars
            stars.forEach(([x, y]) => {
              const size = 1.5;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.fill();
            });
          });

          ctx.restore();

          // Very slow rotation
          rotation += 0.0001;
          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      case 'fireflies': {
        const fireflies: Array<{
          x: number;
          y: number;
          vx: number;
          vy: number;
          brightness: number;
          blinkSpeed: number;
          blinkPhase: number;
        }> = [];

        // Create fireflies
        for (let i = 0; i < 15; i++) {
          fireflies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            brightness: 0,
            blinkSpeed: Math.random() * 0.02 + 0.01,
            blinkPhase: Math.random() * Math.PI * 2
          });
        }

        const animate = () => {
          // Clear completely to avoid trails
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          fireflies.forEach(firefly => {
            // Update position
            firefly.x += firefly.vx;
            firefly.y += firefly.vy;

            // Bounce off edges
            if (firefly.x < 0 || firefly.x > canvas.width) firefly.vx *= -1;
            if (firefly.y < 0 || firefly.y > canvas.height) firefly.vy *= -1;

            // Update brightness (blinking)
            firefly.blinkPhase += firefly.blinkSpeed;
            firefly.brightness = Math.sin(firefly.blinkPhase) * 0.5 + 0.5;

            // Draw smaller firefly with glow
            const gradient = ctx.createRadialGradient(firefly.x, firefly.y, 0, firefly.x, firefly.y, 4);
            gradient.addColorStop(0, `rgba(255, 247, 127, ${firefly.brightness})`);
            gradient.addColorStop(0.5, `rgba(255, 247, 127, ${firefly.brightness * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 247, 127, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(firefly.x - 4, firefly.y - 4, 8, 8);
          });

          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      case 'starfield': {
        const stars: Array<{ x: number; y: number; size: number; brightness: number }> = [];
        const shootingStars: Array<{ x: number; y: number; length: number; speed: number; opacity: number }> = [];

        // Create static stars
        for (let i = 0; i < 200; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            brightness: Math.random() * 0.5 + 0.5
          });
        }

        const animate = () => {
          // Clear completely to avoid trails
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw static stars with twinkling
          stars.forEach(star => {
            star.brightness += (Math.random() - 0.5) * 0.05;
            star.brightness = Math.max(0.1, Math.min(0.6, star.brightness));

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.fill();
          });

          // Occasionally create shooting stars
          if (Math.random() < 0.005 && shootingStars.length < 2) {
            shootingStars.push({
              x: Math.random() * canvas.width,
              y: 0,
              length: Math.random() * 50 + 30,
              speed: Math.random() * 5 + 5,
              opacity: Math.random() * 0.5 + 0.5
            });
          }

          // Draw and update shooting stars
          for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];

            const gradient = ctx.createLinearGradient(star.x, star.y, star.x + star.length * 0.5, star.y + star.length * 0.5);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${star.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x + star.length * 0.5, star.y + star.length * 0.5);
            ctx.stroke();

            star.x += star.speed;
            star.y += star.speed;
            star.opacity -= 0.01;

            if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
              shootingStars.splice(i, 1);
            }
          }

          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }



      case 'deep_ocean': {
        let time = 0;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Create caustic light patterns
          for (let i = 0; i < 5; i++) {
            const x = (Math.sin(time * 0.5 + i * 2) + 1) * canvas.width * 0.5;
            const y = (Math.cos(time * 0.3 + i * 1.5) + 1) * canvas.height * 0.5;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
            gradient.addColorStop(0, 'rgba(91, 134, 229, 0.1)');
            gradient.addColorStop(0.5, 'rgba(91, 134, 229, 0.05)');
            gradient.addColorStop(1, 'rgba(91, 134, 229, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Add depth gradient
          const depthGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          depthGradient.addColorStop(0, 'rgba(5, 25, 55, 0.3)');
          depthGradient.addColorStop(1, 'rgba(5, 25, 55, 0)');
          ctx.fillStyle = depthGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          time += 0.01;
          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      case 'northern_lights': {
        let time = 0;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Create aurora bands with distinct characteristics
          for (let band = 0; band < 3; band++) {
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += 10) {
              let y;
              if (band === 0) {
                // Top band - slow, wide waves
                y = canvas.height * 0.2 +
                    Math.sin((x * 0.001) + time * 0.5) * 120 +
                    Math.sin((x * 0.003) + time * 0.3) * 60;
              } else if (band === 1) {
                // Middle band - medium waves
                y = canvas.height * 0.35 +
                    Math.sin((x * 0.002) + time * 0.8 + 2) * 80 +
                    Math.sin((x * 0.006) + time * 1.2) * 40;
              } else {
                // Bottom band - fast, sharp waves
                y = canvas.height * 0.5 +
                    Math.sin((x * 0.004) + time * 1.5 + 4) * 60 +
                    Math.sin((x * 0.008) + time * 2) * 30;
              }

              if (x === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            // Distinct colors and opacities
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
            if (band === 0) {
              gradient.addColorStop(0, 'rgba(138, 43, 226, 0.35)'); // Bright Purple
              gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
            } else if (band === 1) {
              gradient.addColorStop(0, 'rgba(34, 200, 34, 0.25)'); // Bright Green
              gradient.addColorStop(1, 'rgba(34, 200, 34, 0)');
            } else {
              gradient.addColorStop(0, 'rgba(0, 191, 255, 0.15)'); // Cyan-Blue
              gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
            }

            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();
          }

          time += 0.01;
          animationId = requestAnimationFrame(animate);
        };
        animate();
        break;
      }
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: type === 'static_noise' ? 0.03 : 0.6,
      }}
    />
  );
}