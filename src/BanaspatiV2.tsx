import React, { useEffect, useRef, useCallback, useState } from "react";
import { FloatingText } from "./shared";

export interface BanaspatiV2Props {
  v2Color?: string;
  v2Wind?: number;
  v2RiseSpeed?: number;
  v2Size?: number;
  v2Turbulence?: number;
  v2NoiseFreq?: number;
  v2SparkCount?: number;
  v2ShowFace?: boolean;
  v2FaceColor?: string;
  v2EyeSpacing?: number;
  v2EyeSize?: number;
  v2EyeSquint?: number;
  v2EyeTilt?: number;
  v2MouthWidth?: number;
  v2MouthOpen?: number;
  v2MouthSmile?: number;
  v2MouthY?: number;
  followCursor?: boolean;
  lookAt?: { x: number; y: number };
  onClick?: () => void;
  speech?: string;
  speechKey?: string | number;
  speechFontSize?: number;
  speechDisappearDelay?: number;
  size?: number;
  responsive?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function BanaspatiV2({
  v2Color        = "#10c8a8",
  v2Wind         = 0,
  v2RiseSpeed    = 1,
  v2Size         = 1.2,
  v2Turbulence   = 25,
  v2NoiseFreq    = 0.015,
  v2SparkCount   = 12,
  v2ShowFace     = true,
  v2FaceColor    = "#ffffff",
  v2EyeSpacing   = 16,
  v2EyeSize      = 5,
  v2EyeSquint    = 0,
  v2EyeTilt      = 0,
  v2MouthWidth   = 8,
  v2MouthOpen    = 0,
  v2MouthSmile   = 6,
  v2MouthY       = 14,
  followCursor   = true,
  lookAt,
  onClick,
  speech,
  speechKey,
  speechFontSize = 16,
  speechDisappearDelay = 3000,
  size           = 160,
  responsive     = false,
  onPointerDown,
}: BanaspatiV2Props) {
  // ── Sizing ────────────────────────────────────────────────────────────────
  const [observedSize, setObservedSize] = useState<number>(size);
  const responsiveContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!responsive) setObservedSize(size);
  }, [size, responsive]);

  useEffect(() => {
    if (!responsive || !responsiveContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0)
          setObservedSize(Math.max(40, Math.min(width, height) / 1.625));
      }
    });
    observer.observe(responsiveContainerRef.current);
    return () => observer.disconnect();
  }, [responsive]);

  const activeSize  = responsive ? observedSize : size;
  const scaleFactor = activeSize / 160;
  // The scene canvas is square, sized generously to contain the full flame
  const sceneSize   = activeSize * 2.2;

  // ── Canvas refs ───────────────────────────────────────────────────────────
  const flameCanvasRef = useRef<HTMLCanvasElement>(null); // goo-filtered blobs
  const glowCanvasRef  = useRef<HTMLCanvasElement>(null); // additive layers + face
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const speechRef      = useRef<HTMLDivElement>(null);

  // ── Physics (drag) ────────────────────────────────────────────────────────
  const dragRef = useRef({
    isDragging: false,
    lastX: 0, lastY: 0,
    vx: 0, vy: 0,
    // target position (canvas space) — flame lerps toward this
    targetCx: -1, targetCy: -1, // -1 = uninitialized (will be set to S/2 on first loop)
  });

  // ── Gaze ──────────────────────────────────────────────────────────────────
  const followCursorRef = useRef(followCursor);
  const lookAtRef       = useRef(lookAt);
  const targetEye       = useRef({ x: 0, y: 0 });
  const currentEye      = useRef({ x: 0, y: 0 });

  useEffect(() => { followCursorRef.current = followCursor; }, [followCursor]);
  useEffect(() => {
    lookAtRef.current = lookAt;
    if (!followCursorRef.current && lookAt)
      targetEye.current = { x: lookAt.x * 22 * scaleFactor, y: lookAt.y * 16 * scaleFactor };
  }, [lookAt?.x, lookAt?.y, scaleFactor]);

  useEffect(() => {
    if (!followCursor && !lookAt) targetEye.current = { x: 0, y: 0 };
  }, [followCursor, lookAt]);

  // Mouse tracking (relative to centre of the scene wrapper)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!followCursorRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist  = Math.sqrt(dx * dx + dy * dy) || 1;
    const scale = Math.min(dist, activeSize * 1.5) / (activeSize * 1.5);
    targetEye.current = { x: (dx / dist) * 22 * scaleFactor * scale, y: (dy / dist) * 16 * scaleFactor * scale };
  }, [scaleFactor, activeSize]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ── Flame params ref ──────────────────────────────────────────────────────
  const flameParamsRef = useRef({
    color:        v2Color,
    wind:         v2Wind,
    riseSpeed:    v2RiseSpeed,
    size:         v2Size,
    turbulence:   v2Turbulence,
    noiseFreq:    v2NoiseFreq,
    sparkCount:   v2SparkCount,
    showFace:     v2ShowFace,
    faceColor:    v2FaceColor,
    eyeSpacing:   v2EyeSpacing,
    eyeSize:      v2EyeSize,
    eyeSquint:    v2EyeSquint,
    eyeTilt:      v2EyeTilt,
    mouthWidth:   v2MouthWidth,
    mouthOpen:    v2MouthOpen,
    mouthSmile:   v2MouthSmile,
    mouthY:       v2MouthY,
  });
  useEffect(() => {
    flameParamsRef.current.color        = v2Color;
    flameParamsRef.current.wind         = v2Wind;
    flameParamsRef.current.riseSpeed    = v2RiseSpeed;
    flameParamsRef.current.size         = v2Size;
    flameParamsRef.current.turbulence   = v2Turbulence;
    flameParamsRef.current.noiseFreq    = v2NoiseFreq;
    flameParamsRef.current.sparkCount   = v2SparkCount;
    flameParamsRef.current.showFace     = v2ShowFace;
    flameParamsRef.current.faceColor    = v2FaceColor;
    flameParamsRef.current.eyeSpacing   = v2EyeSpacing;
    flameParamsRef.current.eyeSize      = v2EyeSize;
    flameParamsRef.current.eyeSquint    = v2EyeSquint;
    flameParamsRef.current.eyeTilt      = v2EyeTilt;
    flameParamsRef.current.mouthWidth   = v2MouthWidth;
    flameParamsRef.current.mouthOpen    = v2MouthOpen;
    flameParamsRef.current.mouthSmile   = v2MouthSmile;
    flameParamsRef.current.mouthY       = v2MouthY;
  }, [v2Color, v2Wind, v2RiseSpeed, v2Size, v2Turbulence, v2NoiseFreq, v2SparkCount, v2ShowFace, v2FaceColor, v2EyeSpacing, v2EyeSize, v2EyeSquint, v2EyeTilt, v2MouthWidth, v2MouthOpen, v2MouthSmile, v2MouthY]);

  // ── Main render loop ──────────────────────────────────────────────────────
  const flameRafV2 = useRef<number>();
  const blinkTimerV2 = useRef<ReturnType<typeof setTimeout>>();
  const isBlinkingV2 = useRef(false);

  useEffect(() => {
    const flameCanvas = flameCanvasRef.current;
    const glowCanvas  = glowCanvasRef.current;
    if (!flameCanvas || !glowCanvas) return;

    const dpr = window.devicePixelRatio || 1;
    const S   = sceneSize;

    // Set physical pixel size
    [flameCanvas, glowCanvas].forEach(c => {
      c.width        = S * dpr;
      c.height       = S * dpr;
      c.style.width  = `${S}px`;
      c.style.height = `${S}px`;
    });

    const ctxF = flameCanvas.getContext("2d")!;
    const ctxG = glowCanvas.getContext("2d")!;
    ctxF.scale(dpr, dpr);
    ctxG.scale(dpr, dpr);

    // Base blobs — orbiting centres that the goo filter merges into one flame body
    const blobs = [
      { angle: 0,   speed: 0.022, radius: 50 * scaleFactor, orbit: 12 * scaleFactor },
      { angle: 2.1, speed: 0.031, radius: 55 * scaleFactor, orbit: 8  * scaleFactor },
      { angle: 4.2, speed: 0.026, radius: 45 * scaleFactor, orbit: 15 * scaleFactor },
      { angle: 1.0, speed: 0.040, radius: 40 * scaleFactor, orbit: 5  * scaleFactor },
    ];

    // Spark class — particles that rise and wobble
    class Spark {
      x = 0; y = 0;
      baseRadius = 0; radius = 0;
      baseVy = 0; baseShrink = 0;
      wobbleSpeed = 0; wobbleOffset = 0;
      vx = 0; vy = 0;

      constructor(initial = false) { this.reset(initial, S / 2, S / 2); }

      reset(initial = false, cx: number, cy: number) {
        const fp = flameParamsRef.current;
        const fsf = scaleFactor * fp.size;
        this.x = cx + (Math.random() - 0.5) * 40 * fsf;
        this.y = initial ? cy - Math.random() * 250 * fsf : cy + (Math.random() - 0.5) * 20 * fsf;
        this.baseRadius  = (10 + Math.random() * 12) * scaleFactor;
        this.baseVy      = (1.5 + Math.random() * 2.5) * scaleFactor;
        this.baseShrink  = (0.15 + Math.random() * 0.2) * scaleFactor;
        this.radius      = this.baseRadius * fp.size;
        this.wobbleSpeed  = 0.05 + Math.random() * 0.05;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.vx = dragRef.current.vx * 0.2;
        this.vy = dragRef.current.vy * 0.2;
      }

      update(time: number, cx: number, cy: number) {
        const fp = flameParamsRef.current;
        this.y += this.vy - this.baseVy * fp.riseSpeed;
        this.x += Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * 1.5 * scaleFactor * fp.size + fp.wind + this.vx;
        this.radius -= this.baseShrink * fp.riseSpeed * fp.size;
        this.vx *= 0.92;
        this.vy *= 0.92;
        if (this.radius <= 0 || this.x < -100 || this.x > S + 100 || this.y < -100 || this.y > S + 100)
          this.reset(false, cx, cy);
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.radius > 0) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const maxSparks = 50;
    const sparks = Array.from({ length: maxSparks }, () => new Spark(true));
    let time = 0;

    // Draw canvas face
    function drawFace(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      eyeX: number, eyeY: number,
      sf: number,
      fp: typeof flameParamsRef.current
    ) {
      if (!fp.showFace) return;

      const fsf = sf * fp.size;
      const eSpace   = fp.eyeSpacing * fsf;
      const eSize    = fp.eyeSize    * fsf;
      const eyeHt    = Math.max(0.3, eSize * 1.35 * (1 - fp.eyeSquint)) * (isBlinkingV2.current ? 0.05 : 1);
      const tiltRad  = (fp.eyeTilt * Math.PI) / 180;

      const wobble = Math.sin(time * 0.04) * 2 * fsf;
      const fx = cx + eyeX;
      const fy = cy - 10 * fsf + eyeY + wobble;

      ctx.fillStyle   = fp.faceColor;
      ctx.strokeStyle = fp.faceColor;
      ctx.lineWidth   = Math.max(2, 3 * fsf);
      ctx.lineCap     = "round";
      ctx.shadowColor = fp.faceColor;
      ctx.shadowBlur  = 12 * fsf;

      // Left eye
      ctx.beginPath();
      ctx.ellipse(fx - eSpace, fy, eSize, eyeHt, tiltRad, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(fx + eSpace, fy, eSize, eyeHt, -tiltRad, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      const mY    = fy + fp.mouthY * fsf;
      const mW    = fp.mouthWidth * fsf;
      const mOpen = fp.mouthOpen  * fsf;
      const mSm   = fp.mouthSmile * fsf;

      ctx.shadowBlur = 6 * fsf;
      ctx.beginPath();
      if (mOpen > 0.5 * sf) {
        ctx.ellipse(fx, mY + mOpen / 2, mW, mOpen, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(fx - mW, mY);
        ctx.quadraticCurveTo(fx, mY + mSm, fx + mW, mY);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    }

    // Centre of the scene (adjustable by drag)
    let cx = S / 2;
    let cy = S / 2 + 30 * scaleFactor; // slightly below centre like v2 reference

    // Blink schedule
    const scheduleBlink = () => {
      blinkTimerV2.current = setTimeout(() => {
        isBlinkingV2.current = true;
        setTimeout(() => { isBlinkingV2.current = false; }, 130);
        scheduleBlink();
      }, 2000 + Math.random() * 3000);
    };
    scheduleBlink();

    const loop = () => {
      time++;
      const fp = flameParamsRef.current;
      const sparkCount = fp.sparkCount;

      // ── Gaze lerp ───────────────────────────────────────────────────────
      const ex = currentEye.current, tx = targetEye.current;
      ex.x += (tx.x - ex.x) * 0.10;
      ex.y += (tx.y - ex.y) * 0.10;

      // ── Drag physics (target + lerp — mirrors NEW_FLAME architecture) ────
      const d = dragRef.current;
      // Initialise target on first frame
      if (d.targetCx < 0) { d.targetCx = cx; d.targetCy = cy; }

      if (!d.isDragging) {
        // Apply inertia to the target, not directly to position
        d.targetCx += d.vx;
        d.targetCy += d.vy;
        d.vx *= 0.93;
        d.vy *= 0.93;
        // Wall clamp on target
        const margin = 60 * scaleFactor;
        if (d.targetCx < margin)      { d.targetCx = margin;      d.vx *= -0.7; }
        if (d.targetCx > S - margin)  { d.targetCx = S - margin;  d.vx *= -0.7; }
        if (d.targetCy < margin)      { d.targetCy = margin;      d.vy *= -0.7; }
        if (d.targetCy > S - margin)  { d.targetCy = S - margin;  d.vy *= -0.7; }
      }

      // Smooth lerp toward target (0.15 matches NEW_FLAME)
      cx += (d.targetCx - cx) * 0.15;
      cy += (d.targetCy - cy) * 0.15;

      if (speechRef.current) {
        // Center horizontally
        const dx = Math.round(cx - S / 2);
        // Shift down so it floats below the face (compensating for the internal -48px margin)
        const dy = Math.round(cy - S / 2 + 100 * scaleFactor);
        speechRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }

      // ── Flame canvas (goo-filtered blobs + sparks) ───────────────────────
      ctxF.clearRect(0, 0, S, S);
      ctxF.fillStyle = fp.color;

      blobs.forEach(b => {
        b.angle += b.speed;
        const bx = cx + Math.cos(b.angle) * b.orbit * fp.size;
        const by = cy + Math.sin(b.angle) * b.orbit * fp.size;
        ctxF.beginPath();
        ctxF.arc(bx, by, b.radius * fp.size, 0, Math.PI * 2);
        ctxF.fill();
      });

      for (let i = 0; i < sparkCount; i++) {
        sparks[i].update(time, cx, cy);
        sparks[i].draw(ctxF);
      }

      // ── Face canvas ──────────────────────────────────────────────────────
      ctxG.clearRect(0, 0, S, S);
      ctxG.globalCompositeOperation = "source-over";
      ctxG.globalAlpha = 1;
      drawFace(ctxG, cx, cy, ex.x, ex.y, scaleFactor, fp);

      flameRafV2.current = requestAnimationFrame(loop);
    };

    flameRafV2.current = requestAnimationFrame(loop);
    return () => {
      if (flameRafV2.current) cancelAnimationFrame(flameRafV2.current);
      clearTimeout(blinkTimerV2.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneSize, activeSize, scaleFactor]);

  // ── Pointer events (drag) ─────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const rect = wrapperRef.current?.getBoundingClientRect();
    
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const dist = Math.sqrt(Math.pow(clickX - d.targetCx, 2) + Math.pow(clickY - d.targetCy, 2));
      
      // Only grab if we clicked directly on/near the character body
      if (dist <= 100 * scaleFactor) {
        d.isDragging = true;
        d.vx = 0;
        d.vy = 0;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        d.targetCx = clickX;
        d.targetCy = clickY;
      }
    }
    onPointerDown?.(e);
    onClick?.();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.isDragging) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Velocity from screen-space delta (for post-release inertia)
    d.vx = e.clientX - d.lastX;
    d.vy = e.clientY - d.lastY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    // Target = exact cursor position in canvas space
    d.targetCx = e.clientX - rect.left;
    d.targetCy = e.clientY - rect.top;
  };

  const handlePointerUp = () => { dragRef.current.isDragging = false; };

  // ── Render ────────────────────────────────────────────────────────────────
  const containerSz = sceneSize;

  return (
    <>
      {/* Scoped keyframe styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes ba-sparkOut {
          0%   { transform: var(--sr) translateX(var(--sd)) scale(1); opacity: 1; }
          100% { transform: var(--sr) translateX(calc(var(--sd) + ${24 * scaleFactor}px)) scale(0); opacity: 0; }
        }
        @keyframes ba-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* SVG goo filter — referenced by the flame canvas */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          <filter id="ba-v2-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={12 * scaleFactor} result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" result="goo" />
            <feTurbulence type="fractalNoise" baseFrequency={v2NoiseFreq}
              numOctaves="2" result="noise" />
            <feDisplacementMap in="goo" in2="noise"
              scale={v2Turbulence} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Outer layout */}
      <div
        ref={responsiveContainerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: responsive ? "center" : undefined,
          width:  responsive ? "100%" : undefined,
          height: responsive ? "100%" : undefined,
          boxSizing: "border-box",
        }}
      >
        {/* Strict relative bounds to separate stacking contexts */}
        <div style={{ position: "relative", width: containerSz, height: containerSz, flexShrink: 0 }}>
          
          {/* Speech Text Overlay — OUTSIDE the canvas wrapper layer! */}
          <div
            ref={speechRef}
            style={{
              position: "absolute",
              left: 0, top: 0,
              width: "100%", height: "100%",
              pointerEvents: "none",
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              willChange: "transform",
            }}
          >
            <FloatingText
              message={speech}
              speechKey={speechKey}
              scaleFactor={scaleFactor}
              fontSize={speechFontSize}
              disappearDelay={speechDisappearDelay}
              containerHeight={containerSz}
            />
          </div>

          {/* Scene wrapper — provides pointer events for drag */}
          <div
            ref={wrapperRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              position: "absolute",
              left: 0, top: 0,
              width: "100%", height: "100%",
              cursor: dragRef.current.isDragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
            }}
          >
          {/* Layer 1: goo-filtered blobs + sparks */}
          <canvas
            ref={flameCanvasRef}
            style={{
              position: "absolute",
              top: 0, left: 0,
              width:  `${containerSz}px`,
              height: `${containerSz}px`,
              filter: "url(#ba-v2-goo)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Layer 2: un-filtered face + soft glow */}
          <canvas
            ref={glowCanvasRef}
            style={{
              position: "absolute",
              top: 0, left: 0,
              width:  "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        </div>{/* End Scene Wrapper */}
      </div>{/* End strict bounds */}
      </div>{/* End responsiveContainerRef */}
    </>
  );
}
