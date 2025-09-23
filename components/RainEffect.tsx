'use client';

import { useEffect, useRef } from 'react';

export function RainEffect() {
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

    // Rain drops array
    const rainDrops: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
    }> = [];

    // Initialize rain drops - reduced by 1/3
    const dropCount = Math.floor(window.innerWidth / 25); // Less density
    for (let i = 0; i < dropCount; i++) {
      rainDrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height, // Start above screen
        length: Math.random() * 20 + 15, // 15-35px long (larger)
        speed: Math.random() * 4 + 4, // 4-8px per frame
        opacity: Math.random() * 0.25 + 0.1, // 0.1-0.35 opacity (more visible)
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear canvas completely to avoid trails
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw rain drops
      rainDrops.forEach(drop => {
        // Draw the rain drop
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(255, 255, 255, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Update position
        drop.y += drop.speed;

        // Reset if off screen
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
          drop.speed = Math.random() * 3 + 3;
          drop.opacity = Math.random() * 0.15 + 0.05;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

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
        zIndex: -1, // Behind everything
        opacity: 0.4, // More subtle overall opacity
      }}
    />
  );
}