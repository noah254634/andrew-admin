import { useRef, useEffect } from 'react';

/**
 * Dynamic Living Starfield Canvas.
 * 
 * Ambient Animation:
 * 1. Constant natural drifting & floating motion for all stars even when no cursor is present.
 * 2. Subtle organic wave motion (sine/cosine orbital drift) so stars don't float in rigid straight lines.
 * 3. Continuous twinkling & pulsation.
 * 4. Responsive cursor attraction & mobile touch optimization.
 */
export default function StarfieldCanvas({ particleCount: overrideCount }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Accessibility check
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animId;
    let pointer = { x: null, y: null, speed: 0 };
    let stars = [];
    let trailParticles = [];
    let isMobile = false;

    const getThemeColor = () => {
      const style = getComputedStyle(document.documentElement);
      const muted = style.getPropertyValue('--text-muted').trim() || '#787774';
      const accent = style.getPropertyValue('--accent-bronze').trim() || '#4A433B';
      return { muted, accent };
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
      isMobile = window.innerWidth <= 768;
    };

    // Base star generation — each star given ambient float speed & wave parameters
    const createStar = () => {
      const depth = Math.random(); // 0 (distant) to 1 (near)
      const baseSize = depth * 1.5 + 1.0;
      
      // Ambient velocity — constant floating speed based on depth
      const angle = Math.random() * Math.PI * 2;
      const speed = (depth * 0.4 + 0.25); // Guaranteed minimum drift speed (0.25 to 0.65 px/frame)

      return {
        x: Math.random() * (canvas.width || window.innerWidth),
        y: Math.random() * (canvas.height || window.innerHeight),
        size: baseSize,
        baseSize,
        depth,
        // Ambient drift velocity components
        baseVx: Math.cos(angle) * speed,
        baseVy: Math.sin(angle) * speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        // Organic wave phase variables
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: Math.random() * 0.02 + 0.008,
        waveAmplitude: Math.random() * 0.25 + 0.1,
        // Twinkle
        opacity: depth * 0.45 + 0.3,
        baseOpacity: depth * 0.45 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
      };
    };

    const init = () => {
      resize();

      // Adaptive particle count
      const effectiveCount = overrideCount || (window.innerWidth <= 480 ? 100 : window.innerWidth <= 768 ? 140 : 380);

      stars = Array.from({ length: effectiveCount }, createStar);
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { muted, accent } = getThemeColor();

      const attractRadius = isMobile ? 160 : 240;
      const attractStrength = isMobile ? 0.09 : 0.075;

      // 1. Process & Render Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Twinkle effect
        s.opacity = s.baseOpacity + Math.sin(time * 0.003 + s.twinkleOffset) * 0.22;

        let isNearPointer = false;
        let distFraction = 0;

        // Mouse/Touch attraction force
        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - s.x;
          const dy = pointer.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < attractRadius) {
            distFraction = 1 - dist / attractRadius;
            const force = distFraction * attractStrength * (s.depth * 0.7 + 0.3);
            s.vx += dx * force;
            s.vy += dy * force;
            isNearPointer = true;
          }
        }

        // Apply friction to mouse forces while returning smoothly to ambient base velocity
        s.vx = s.vx * 0.93 + s.baseVx * 0.07;
        s.vy = s.vy * 0.93 + s.baseVy * 0.07;

        // Add organic wave float offset so stars gently sway in space
        s.wavePhase += s.waveSpeed;
        const waveX = Math.cos(s.wavePhase) * s.waveAmplitude;
        const waveY = Math.sin(s.wavePhase) * s.waveAmplitude;

        // Update position
        s.x += s.vx + waveX;
        s.y += s.vy + waveY;

        // Wrap around canvas boundaries smoothly
        if (s.x < -20) s.x = canvas.width + 20;
        if (s.x > canvas.width + 20) s.x = -20;
        if (s.y < -20) s.y = canvas.height + 20;
        if (s.y > canvas.height + 20) s.y = -20;

        // Controlled Medium Sizing: 4.0px max cap on desktop, 3.2px on mobile
        const renderSize = isNearPointer
          ? Math.min(s.baseSize + distFraction * 1.6, isMobile ? 3.2 : 4.0)
          : s.baseSize;

        const color = isNearPointer ? accent : muted;
        const alpha = Math.max(0.2, Math.min(1, s.opacity + (isNearPointer ? 0.35 : 0)));

        // Soft glow for near stars on desktop
        if (isNearPointer && !isMobile) {
          ctx.shadowBlur = Math.min(distFraction * 10, 10);
          ctx.shadowColor = accent;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, renderSize, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // 2. Cursor Sparkle Emission
      if (pointer.x !== null && pointer.y !== null && pointer.speed > 1) {
        const spawnLimit = isMobile ? 3 : 5;
        const spawnCount = Math.min(Math.floor(pointer.speed * 0.35), spawnLimit);
        for (let i = 0; i < spawnCount; i++) {
          trailParticles.push({
            x: pointer.x + (Math.random() - 0.5) * (isMobile ? 8 : 10),
            y: pointer.y + (Math.random() - 0.5) * (isMobile ? 8 : 10),
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2 + 0.3,
            size: Math.random() * (isMobile ? 1.4 : 1.8) + 1.0,
            life: 1.0,
            decay: Math.random() * 0.04 + (isMobile ? 0.035 : 0.025),
          });
        }
      }

      // 3. Render Trail Particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const tp = trailParticles[i];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.life -= tp.decay;

        if (tp.life <= 0) {
          trailParticles.splice(i, 1);
          continue;
        }

        if (!isMobile) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = accent;
        }
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.size * tp.life, 0, Math.PI * 2);
        ctx.fillStyle = accent + Math.round(tp.life * 230).toString(16).padStart(2, '0');
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    };

    // Pointer Event Handlers
    const updatePointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const nx = clientX - rect.left;
      const ny = clientY - rect.top;

      if (nx >= -60 && nx <= rect.width + 60 && ny >= -60 && ny <= rect.height + 60) {
        if (pointer.x !== null && pointer.y !== null) {
          const dx = nx - pointer.x;
          const dy = ny - pointer.y;
          pointer.speed = Math.sqrt(dx * dx + dy * dy);
        }
        pointer.x = nx;
        pointer.y = ny;
      } else {
        pointer.x = null;
        pointer.y = null;
        pointer.speed = 0;
      }
    };

    const handleMouseMove = (e) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerReset = () => {
      pointer.x = null;
      pointer.y = null;
      pointer.speed = 0;
    };

    init();
    animId = requestAnimationFrame(draw);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePointerReset, { passive: true });
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchend', handlePointerReset);
      window.removeEventListener('resize', init);
    };
  }, [overrideCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
