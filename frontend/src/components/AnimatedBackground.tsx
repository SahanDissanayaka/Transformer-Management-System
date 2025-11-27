import React, { useEffect, useRef } from 'react';
import '../styles/AnimatedBackground.css';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
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
    }

    const particles: Particle[] = [];

    // Create fewer, slower particles for a more subtle effect
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1,
        opacity: Math.random() * 0.3,
        color: ['#00d4ff', '#0099ff', '#6633ff'][Math.floor(Math.random() * 3)],
      });
    }

    interface LightningPoint {
      x: number;
      y: number;
      opacity: number;
    }

    interface Lightning {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      segments: number;
      opacity: number;
      duration: number;
      age: number;
      trail: LightningPoint[];
    }

    let lightnings: Lightning[] = [];
    let lightningTimer = 0;
    const lightningInterval = 4000 + Math.random() * 3000;

    const drawLightning = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      segments: number,
      opacity: number,
      trail: LightningPoint[]
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Generate lightning path
      const path: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];
      for (let i = 0; i < segments; i++) {
        const nextT = (i + 1) / segments;
        const baseX = x1 + dx * nextT;
        const baseY = y1 + dy * nextT;
        const offsetAngle = angle + (Math.random() - 0.5) * 0.3;
        const offsetDist = (Math.random() - 0.5) * dist * 0.05;
        const nextX = baseX + Math.cos(offsetAngle + Math.PI / 2) * offsetDist;
        const nextY = baseY + Math.sin(offsetAngle + Math.PI / 2) * offsetDist;
        path.push({ x: nextX, y: nextY });
      }
      path.push({ x: x2, y: y2 });

      // Add path to trail for comet effect
      path.forEach((p) => {
        trail.push({ x: p.x, y: p.y, opacity });
      });

      // Keep trail manageable
      if (trail.length > 40) {
        trail.shift();
      }

      // Draw trail with fading effect
      for (let i = 0; i < trail.length - 1; i++) {
        const trailOpacity = (i / trail.length) * opacity * 0.3;
        ctx.strokeStyle = `rgba(0, 150, 255, ${trailOpacity})`;
        ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(trail[i].x, trail[i].y);
        ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
        ctx.stroke();
      }

      // Main lightning bolt
      ctx.strokeStyle = `rgba(100, 220, 255, ${opacity * 0.8})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      path.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Inner bright core
      ctx.strokeStyle = `rgba(150, 240, 255, ${opacity * 0.6})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      path.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Outer glow
      ctx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.4})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      path.forEach((p) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    };

    const createLightning = () => {
      const startX = Math.random() * canvas.width;
      const startY = 0;
      const endX = Math.random() * canvas.width;
      const endY = canvas.height * 0.5 + Math.random() * canvas.height * 0.3;

      lightnings.push({
        startX,
        startY,
        endX,
        endY,
        segments: 25,
        opacity: 1,
        duration: 60,
        age: 0,
        trail: [],
      });
    };

    const animate = () => {
      // Clear canvas with subtle overlay for minimal trail effect
      ctx.fillStyle = 'rgba(10, 5, 30, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity += (Math.random() - 0.5) * 0.01;

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Clamp opacity
        particle.opacity = Math.max(0, Math.min(0.3, particle.opacity));

        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      lightnings = lightnings.filter((lightning) => lightning.age < lightning.duration);

      lightnings.forEach((lightning) => {
        const progress = lightning.age / lightning.duration;
        const opacity = Math.max(0, 1 - progress);

        drawLightning(
          lightning.startX,
          lightning.startY,
          lightning.endX,
          lightning.endY,
          lightning.segments,
          opacity,
          lightning.trail
        );

        lightning.age += 1;
      });

      // Lightning timing - less frequent
      lightningTimer += 1;
      if (lightningTimer > lightningInterval) {
        createLightning();
        lightningTimer = 0;
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="animated-background" />;
};

export default AnimatedBackground;
