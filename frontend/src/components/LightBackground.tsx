import React, { useEffect, useRef } from 'react';
import '../styles/LightBackground.css';

const LightBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      color: string;
      trail: Array<{ x: number; y: number }>;
      maxTrail: number;
    }

    const particles: Particle[] = [];

    // Create more visible particles for light theme (same speed/size as dark mode)
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.25 + 0.15,
        color: ['#0ea5e9', '#06b6d4', '#3b82f6', '#0891b2'][Math.floor(Math.random() * 4)],
        trail: [],
        maxTrail: 15,
      });
    }

    const animate = () => {
      // Clear with fade effect to show comet trails
      ctx.fillStyle = 'rgba(245, 247, 250, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Add current position to trail
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > particle.maxTrail) {
          particle.trail.shift();
        }

        // Draw comet trail
        particle.trail.forEach((pos, index) => {
          const trailOpacity = (index / particle.maxTrail) * particle.opacity * 0.5;
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = trailOpacity;
          const trailRadius = (particle.radius * (index + 1)) / particle.maxTrail;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, trailRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity += (Math.random() - 0.5) * 0.02;

        // Wrap around with smooth boundaries
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        // Clamp opacity
        particle.opacity = Math.max(0.2, Math.min(0.6, particle.opacity));

        // Draw main particle with glow
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.strokeStyle = particle.color;
        ctx.globalAlpha = particle.opacity * 0.3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="light-background" />;
};

export default LightBackground;
