/**
 * Banaspati
 * ---------
 * A self-contained animated teal blob avatar with:
 *   - Physics-based bounce & squash on click
 *   - Perlin-noise flame rendered on a canvas behind the sphere
 *   - Mouse-tracked eye movement + periodic blinking
 *   - Six mood expressions controllable via prop
 *
 * Zero external dependencies — only React + a browser canvas.
 *
 * Usage:
 *   import Banaspati from "@rfahmi/banaspati";
 *
 *   <Banaspati mood="happy" flameAmplitude={50} sphereScale={1} />
 */

"use client";

import React, { useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Perlin noise engine (used by the flame canvas loop)
// ─────────────────────────────────────────────────────────────────────────────
function buildPerlin() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp  = (t: number, a: number, b: number) => a + t * (b - a);

  function grad2(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }

  function noise2D(x: number, y: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[X    ] + Y    ], ab = perm[perm[X    ] + Y + 1];
    const ba = perm[perm[X + 1] + Y    ], bb = perm[perm[X + 1] + Y + 1];
    return lerp(v,
      lerp(u, grad2(aa, xf, yf),     grad2(ba, xf - 1, yf)),
      lerp(u, grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1))
    );
  }

  function fbm(x: number, y: number, octaves = 4, lacunarity = 2.0, gain = 0.45) {
    let val = 0, amp = 1, freq = 1, mx = 0;
    for (let i = 0; i < octaves; i++) {
      val += amp * noise2D(x * freq, y * freq);
      mx  += amp; amp *= gain; freq *= lacunarity;
    }
    return val / mx;
  }

  return { noise2D, fbm };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

/** The six available mood expressions. Controls eye shape. */
export type AvatarMood =
  | "idle"        // neutral, round eyes
  | "happy"       // bottom-clipped (smile-eyes)
  | "surprised"   // wide open, larger radius
  | "sleepy"      // top-clipped (half-closed)
  | "excited"     // slightly bottom-clipped, smaller radius
  | "suspicious"; // asymmetric top-clip (side-eye)

export interface BanaspatiProps {
  // ── Mood ──────────────────────────────────────────────────────────────────

  /**
   * Controls the eye expression.
   * @default "idle"
   */
  mood?: AvatarMood;

  // ── Sphere appearance ─────────────────────────────────────────────────────

  /**
   * Opacity of the sphere body (0–1).
   * The eyes are NOT affected — they remain fully visible at any opacity.
   * Useful for ghosting the sphere so the flame behind it shows through.
   * @default 1
   */
  sphereOpacity?: number;

  /**
   * Scale multiplier for the sphere (and flame). 1 = default size.
   * 0 = invisible, 2 = double size. Squash/bounce physics scale with it.
   * @default 1
   */
  sphereScale?: number;

  // ── Flame controls ────────────────────────────────────────────────────────

  /**
   * Maximum spike height of the flame tips in pixels.
   * Higher values make the flame taller and more dramatic.
   * Range: 0–80  @default 40
   */
  flameAmplitude?: number;

  /**
   * Overall brightness multiplier applied to all flame layers.
   * 0 = invisible flame, 2 = very bright.
   * Range: 0–2  @default 1.0
   */
  flameIntensity?: number;

  /**
   * Speed at which noise scrolls upward, creating the drifting fire effect.
   * 0 = frozen flame, 3 = fast-moving.
   * Range: 0–3  @default 1.0
   */
  flameDrift?: number;

  /**
   * Frequency of the Perlin noise used to shape the flame edge.
   * Low values → large smooth waves. High values → fine turbulent detail.
   * Range: 0.3–3  @default 1.5
   */
  flameNoiseScale?: number;

  /**
   * How much the flame at the sides of the sphere is redirected upward
   * instead of outward. 0 = pure outward, 1.5 = strongly upward.
   * Range: 0–1.5  @default 0.85
   */
  flameUpwardBias?: number;

  /**
   * Controls how sharply the flame tapers toward the crown.
   * Low values (0.5) → wide broad flame. High values (4) → narrow pointed tip.
   * Range: 0.5–4  @default 2.2
   */
  flameSpread?: number;

  // ── Events ────────────────────────────────────────────────────────────────

  /**
   * Called when the user clicks the sphere.
   * The bounce animation always plays; use this for additional side-effects.
   */
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal constants
// ─────────────────────────────────────────────────────────────────────────────

/** Diameter of the sphere in CSS pixels. */
const BALL_SIZE     = 160;
/** Maximum height the sphere reaches at the top of a bounce in pixels. */
const BOUNCE_HEIGHT = 90;
/** Rest Y position (0 = ground level). */
const GROUND_Y      = 0;
/** Canvas size for the flame; must be larger than BALL_SIZE to allow bleed. */
const FLAME_CANVAS  = 320;
/** How many pixels the flame canvas bleeds outside the sphere wrapper on each side. */
const FLAME_OFFSET  = (FLAME_CANVAS - BALL_SIZE) / 2;

type EyeClip = { topL: number; topR: number; bot: number; radius: string };
const EYE_STATES: Record<AvatarMood, EyeClip> = {
  idle:       { topL: 0,  topR: 0,  bot: 0,  radius: "10px" },
  happy:      { topL: 0,  topR: 0,  bot: 48, radius: "10px" },
  surprised:  { topL: 0,  topR: 0,  bot: 0,  radius: "14px" },
  sleepy:     { topL: 50, topR: 50, bot: 0,  radius: "10px" },
  excited:    { topL: 0,  topR: 0,  bot: 10, radius: "8px"  },
  suspicious: { topL: 35, topR: 48, bot: 0,  radius: "10px" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Banaspati — animated teal blob with Perlin-noise flame.
 *
 * Drop it anywhere; it is fully self-contained.
 * All animation runs inside rAF loops and does not trigger React re-renders.
 * Prop changes (flame params, scale, opacity, mood) are applied via refs and
 * take effect on the very next frame — no unmount/remount needed.
 */
export default function Banaspati({
  mood           = "idle",
  sphereOpacity  = 1,
  sphereScale    = 1,
  flameAmplitude = 40,
  flameIntensity = 1.0,
  flameDrift     = 1.0,
  flameNoiseScale = 1.5,
  flameUpwardBias = 0.85,
  flameSpread    = 2.2,
  onClick,
}: BanaspatiProps) {
  // ── DOM refs ───────────────────────────────────────────────────────────────
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const ballRef         = useRef<HTMLDivElement>(null);
  const sphereBgRef     = useRef<HTMLDivElement>(null);
  const shadowRef       = useRef<HTMLDivElement>(null);
  const eyeContainerRef = useRef<HTMLDivElement>(null);
  const eyeLeftRef      = useRef<HTMLDivElement>(null);
  const eyeRightRef     = useRef<HTMLDivElement>(null);
  const flameCanvasRef  = useRef<HTMLCanvasElement>(null);

  // ── Live refs (read every rAF frame — avoids stale closures) ──────────────
  const flameRef = useRef({
    amplitude:  flameAmplitude,
    intensity:  flameIntensity,
    drift:      flameDrift,
    noiseScale: flameNoiseScale,
    upwardBias: flameUpwardBias,
    spread:     flameSpread,
  });
  const sphereScaleRef   = useRef(sphereScale);
  const sphereOpacityRef = useRef(sphereOpacity);
  const moodRef          = useRef<AvatarMood>(mood);

  // Sync live refs whenever props change (takes effect next frame)
  useEffect(() => {
    flameRef.current.amplitude  = flameAmplitude;
    flameRef.current.intensity  = flameIntensity;
    flameRef.current.drift      = flameDrift;
    flameRef.current.noiseScale = flameNoiseScale;
    flameRef.current.upwardBias = flameUpwardBias;
    flameRef.current.spread     = flameSpread;
  }, [flameAmplitude, flameIntensity, flameDrift, flameNoiseScale, flameUpwardBias, flameSpread]);

  useEffect(() => { sphereScaleRef.current = sphereScale; }, [sphereScale]);

  useEffect(() => {
    sphereOpacityRef.current = sphereOpacity;
    if (sphereBgRef.current) sphereBgRef.current.style.opacity = String(sphereOpacity);
  }, [sphereOpacity]);

  // ── Physics refs ───────────────────────────────────────────────────────────
  const frameRef    = useRef<number>();
  const physRef     = useRef({ y: GROUND_Y, vy: 0, sq: 1, sqv: 0, jx: 1, jy: 1, jvx: 0 });
  const targetEye   = useRef({ x: 0, y: 0 });
  const currentEye  = useRef({ x: 0, y: 0 });
  const blinkingRef = useRef(false);
  const flameRafRef = useRef<number>();
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Apply eye shape from mood ──────────────────────────────────────────────
  const applyEyeMood = useCallback((m: AvatarMood) => {
    const s = EYE_STATES[m];
    if (eyeLeftRef.current) {
      eyeLeftRef.current.style.clipPath     = `inset(${s.topL}% 0% ${s.bot}% 0%)`;
      eyeLeftRef.current.style.borderRadius = s.radius;
    }
    if (eyeRightRef.current) {
      eyeRightRef.current.style.clipPath     = `inset(${s.topR}% 0% ${s.bot}% 0%)`;
      eyeRightRef.current.style.borderRadius = s.radius;
    }
  }, []);

  // Apply mood expression when prop changes
  useEffect(() => {
    moodRef.current = mood;
    applyEyeMood(mood);
  }, [mood, applyEyeMood]);

  // ── Blink ──────────────────────────────────────────────────────────────────
  const triggerBlink = useCallback(() => {
    if (blinkingRef.current) return;
    blinkingRef.current = true;
    [eyeLeftRef.current, eyeRightRef.current].forEach(el => {
      if (el) el.style.transform = "scaleY(0.06)";
    });
    setTimeout(() => { blinkingRef.current = false; }, 130);
  }, []);

  // Randomised blink interval (every 2–5 seconds)
  useEffect(() => {
    const schedule = () => {
      blinkTimerRef.current = setTimeout(() => { triggerBlink(); schedule(); },
        2000 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(blinkTimerRef.current);
  }, [triggerBlink]);

  // ── Mouse tracking ─────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ballRef.current) return;
    const rect = ballRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist  = Math.sqrt(dx * dx + dy * dy) || 1;
    const scale = Math.min(dist, 320) / 320;
    targetEye.current = { x: (dx / dist) * 28 * scale, y: (dy / dist) * 22 * scale };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ── Main physics rAF loop ──────────────────────────────────────────────────
  useEffect(() => {
    const GRAVITY      = 2.8;
    const EYE_LERP     = 0.10;
    const SQ_STIFFNESS = 0.30;
    const SQ_DAMPING   = 0.54;
    const JELLY_STIFF  = 0.28;
    const JELLY_DAMP   = 0.52;

    const tick = () => {
      const p = physRef.current;

      // 1. Bounce gravity
      if (p.y < GROUND_Y || p.vy < 0) { p.vy += GRAVITY; p.y += p.vy; }
      if (p.y >= GROUND_Y) {
        const impact = Math.abs(p.vy);
        p.y = GROUND_Y; p.vy = 0;
        if (impact > 3) p.sqv += Math.min(impact * 0.018, 0.30);
      }

      // 2. Squash spring
      const sqAx  = -(p.sq - 1) * SQ_STIFFNESS;
      p.sqv = (p.sqv + sqAx) * SQ_DAMPING;
      p.sq += p.sqv;
      const squashX = 1 + p.sqv * 1.2 + (p.sq - 1);
      const squashY = 1 / Math.max(squashX, 0.6);

      // 3. Jelly click spring
      const jax = -(p.jx - 1) * JELLY_STIFF;
      p.jvx = (p.jvx + jax) * JELLY_DAMP;
      p.jx += p.jvx;
      p.jy  = 2 - p.jx;

      // 4. Eye tracking (lerp toward mouse target)
      const ex = currentEye.current, tx = targetEye.current;
      ex.x += (tx.x - ex.x) * EYE_LERP;
      ex.y += (tx.y - ex.y) * EYE_LERP;

      // 5. Apply transforms
      const heightAboveGround = -p.y;
      const heightRatio = Math.max(0, Math.min(1, heightAboveGround / BOUNCE_HEIGHT));
      const sc = sphereScaleRef.current;

      if (wrapperRef.current)
        wrapperRef.current.style.transform = `translateY(${p.y}px)`;

      if (ballRef.current) {
        ballRef.current.style.transform =
          `scaleX(${squashX * p.jx * sc}) scaleY(${squashY * p.jy * sc})`;
        const coreAlpha = 0.12 + (1 - heightRatio) * 0.10;
        if (sphereBgRef.current)
          sphereBgRef.current.style.boxShadow =
            `inset 0 0 18px 4px rgba(0,230,190,${coreAlpha.toFixed(3)})`;
      }

      // Ground shadow
      if (shadowRef.current) {
        const sW  = 60  + (1 - heightRatio) * 80;
        const sH  = 10  + (1 - heightRatio) * 14;
        const sOp = 0.15 + (1 - heightRatio) * 0.65;
        const sB  = 14  + (1 - heightRatio) * 18;
        shadowRef.current.style.width     = `${sW}px`;
        shadowRef.current.style.height    = `${sH}px`;
        shadowRef.current.style.opacity   = `${sOp}`;
        shadowRef.current.style.filter    = `blur(${sB}px)`;
        shadowRef.current.style.transform =
          `translateX(-50%) translateY(${-p.y + BALL_SIZE / 2 + 18}px)`;
      }

      // Eye container position
      if (eyeContainerRef.current)
        eyeContainerRef.current.style.transform = `translate(${ex.x}px, ${ex.y}px)`;

      // Blink scale
      const blinkSY = blinkingRef.current ? 0.06 : 1;
      if (eyeLeftRef.current)  eyeLeftRef.current.style.transform  = `scaleY(${blinkSY})`;
      if (eyeRightRef.current) eyeRightRef.current.style.transform = `scaleY(${blinkSY})`;

      frameRef.current = requestAnimationFrame(tick);
    };

    physRef.current.y = GROUND_Y;
    physRef.current.vy = 0;
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  // ── Flame canvas rAF loop ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = flameCanvasRef.current;
    if (!canvas) return;

    const dpr  = window.devicePixelRatio || 1;
    const SIZE = FLAME_CANVAS;
    canvas.width        = SIZE * dpr;
    canvas.height       = SIZE * dpr;
    canvas.style.width  = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const perlin       = buildPerlin();
    const sphereRadius = BALL_SIZE / 2;

    function drawFrame(ts: number) {
      const {
        amplitude:  flameAmplitude,
        intensity:  flameIntensity,
        drift:      upwardDrift,
        noiseScale,
        upwardBias,
        spread,
      } = flameRef.current;

      const cx = SIZE / 2, cy = SIZE / 2;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const T_shape = ts * 0.00015;
      const T_drift = ts * 0.00032 * upwardDrift;

      const N          = 128;
      const baseRadius = sphereRadius * 1.32;
      const crownLift  = sphereRadius * 0.06;

      // Build Perlin-displaced edge points around the sphere
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < N; i++) {
        const θ    = (i / N) * Math.PI * 2;
        const cosθ = Math.cos(θ);
        const sinθ = Math.sin(θ);

        const bx = cx + cosθ * baseRadius;
        const by = (cy - crownLift) + sinθ * baseRadius;

        const n  = perlin.fbm(cosθ * noiseScale + T_shape, sinθ * noiseScale - T_drift, 4, 2.0, 0.45);
        const n2 = perlin.noise2D(cosθ * 0.65 + T_shape * 0.45, sinθ * 0.65 - T_drift * 0.38);
        const combinedN = n * 0.72 + n2 * 0.28;

        // Flame only on upper hemisphere; `spread` controls taper sharpness
        const upwardness = Math.pow(Math.max(0, -sinθ), spread);

        // Redirect side-flank displacement upward by upwardBias amount
        const sideways  = Math.abs(cosθ) * Math.max(0, -sinθ);
        let ddx = cosθ;
        let ddy = sinθ - sideways * upwardBias;
        const ddLen = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        ddx /= ddLen; ddy /= ddLen;

        const d = combinedN * flameAmplitude * flameIntensity * upwardness * 2.5;
        pts.push({ x: bx + ddx * d, y: by + ddy * d });
      }

      // Gradient geometry
      const gradCY = cy - sphereRadius * 0.22;
      const gradR  = baseRadius + flameAmplitude * 1.3;

      // Draws one smooth flame layer with a radial gradient fill
      function drawFlameLayer(scale: number, alpha: number, inner: string, outer: string) {
        ctx.save();
        if (scale !== 1) {
          ctx.translate(cx, cy - crownLift);
          ctx.scale(scale, scale);
          ctx.translate(-cx, -(cy - crownLift));
        }
        ctx.beginPath();
        const last = pts[pts.length - 1], first = pts[0];
        ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
        for (let i = 0; i < pts.length; i++) {
          const cur = pts[i], nxt = pts[(i + 1) % pts.length];
          ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + nxt.x) / 2, (cur.y + nxt.y) / 2);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(cx, gradCY, sphereRadius * 0.45, cx, gradCY, gradR);
        g.addColorStop(0,   inner.replace("__A__", (alpha * 0.95).toFixed(3)));
        g.addColorStop(0.4, outer.replace("__A__", (alpha * 0.55).toFixed(3)));
        g.addColorStop(1,   outer.replace("__A__", "0"));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      }

      // Additive blending for glow effect
      ctx.globalCompositeOperation = "lighter";

      // Layer 1 — wide outer halo (deep teal-cyan)
      drawFlameLayer(1.08, 0.07 * flameIntensity, "rgba(0,210,175,__A__)",   "rgba(0,140,130,__A__)");
      // Layer 2 — mid ring (bright teal)
      drawFlameLayer(0.96, 0.13 * flameIntensity, "rgba(80,255,220,__A__)",  "rgba(0,200,170,__A__)");
      // Layer 3 — bright inner core (near-white teal tips)
      drawFlameLayer(0.86, 0.25 * flameIntensity, "rgba(210,255,245,__A__)", "rgba(0,230,195,__A__)");

      // Soft ambient corona around the whole shape
      ctx.globalCompositeOperation = "source-over";
      const corona = ctx.createRadialGradient(cx, gradCY, sphereRadius, cx, gradCY, sphereRadius * 2.6);
      corona.addColorStop(0,    `rgba(0,180,155,${(0.05  * flameIntensity).toFixed(3)})`);
      corona.addColorStop(0.55, `rgba(0,140,125,${(0.022 * flameIntensity).toFixed(3)})`);
      corona.addColorStop(1,    "rgba(0,100,90,0)");
      ctx.beginPath();
      ctx.arc(cx, gradCY, sphereRadius * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = corona;
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      flameRafRef.current = requestAnimationFrame(drawFrame);
    }

    flameRafRef.current = requestAnimationFrame(drawFrame);
    return () => { if (flameRafRef.current) cancelAnimationFrame(flameRafRef.current); };
  }, []);

  // ── Click handler ──────────────────────────────────────────────────────────
  const handleBlobClick = () => {
    if (physRef.current.y < -2) return; // ignore while already airborne
    physRef.current.y   = GROUND_Y;
    physRef.current.vy  = -Math.sqrt(2 * 2.8 * BOUNCE_HEIGHT);
    physRef.current.jvx = 0.18;
    onClick?.();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scoped keyframe styles — injected once, harmless if component mounts multiple times */}
      <style>{`
        @keyframes ba-sparkOut {
          0%   { transform: var(--sr) translateX(var(--sd)) scale(1); opacity: 1; }
          100% { transform: var(--sr) translateX(calc(var(--sd) + 24px)) scale(0); opacity: 0; }
        }
        .ba-eye {
          will-change: transform;
          transform-origin: center center;
          flex-shrink: 0;
          width: 18px; height: 30px;
          background: #ffffff;
          transition: clip-path 0.32s cubic-bezier(0.4,0,0.2,1),
                      border-radius 0.32s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>

      {/* Scene container — sized to contain bounce headroom + shadow */}
      <div style={{
        position: "relative",
        width:  `${BALL_SIZE + 100}px`,
        height: `${BALL_SIZE + BOUNCE_HEIGHT + 80}px`,
        userSelect: "none",
      }}>
        {/* Ground shadow — size & opacity driven by physics loop */}
        <div
          ref={shadowRef}
          style={{
            position: "absolute", bottom: "0px", left: "50%",
            width: "60px", height: "10px",
            background: "radial-gradient(ellipse, rgba(0,220,180,1) 0%, rgba(0,180,140,0.4) 50%, transparent 80%)",
            borderRadius: "50%",
            transformOrigin: "top center",
            pointerEvents: "none",
          }}
        />

        {/* Wrapper div — translateY applies bounce offset each frame */}
        <div
          ref={wrapperRef}
          style={{
            position: "absolute",
            bottom: `${BALL_SIZE / 2}px`,
            left: "50%",
            marginLeft: `-${BALL_SIZE / 2}px`,
            width:  `${BALL_SIZE}px`,
            height: `${BALL_SIZE}px`,
            willChange: "transform",
          }}
        >
          {/* Flame canvas — larger than the sphere and centred behind it */}
          <canvas
            ref={flameCanvasRef}
            style={{
              position: "absolute",
              top:  `-${FLAME_OFFSET}px`,
              left: `-${FLAME_OFFSET}px`,
              width:  `${FLAME_CANVAS}px`,
              height: `${FLAME_CANVAS}px`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Sphere — scaleX/scaleY + sphereScale applied by physics loop */}
          <div
            ref={ballRef}
            onClick={handleBlobClick}
            style={{
              position: "relative",
              width: "100%", height: "100%",
              borderRadius: "50%",
              cursor: "pointer",
              willChange: "transform",
              transformOrigin: "center center",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1,
            }}
          >
            {/* Sphere body (background + glow) — separate div so opacity
                does not bleed onto the eyes above it */}
            <div
              ref={sphereBgRef}
              style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                backgroundImage: `
                  radial-gradient(circle at 35% 28%, rgba(255,255,255,0.18) 0%, transparent 50%),
                  radial-gradient(circle at 42% 32%,
                    #72f0e8 0%, #2dd4bf 18%, #10c8a8 35%,
                    #00b896 52%, #00a07c 70%, #008060 88%, #006048 100%)
                `,
                boxShadow: "inset 0 0 18px 4px rgba(0,230,190,0.12)",
                opacity: sphereOpacity,
                pointerEvents: "none",
              }}
            />

            {/* Eyes — always fully opaque; z-index above sphere body */}
            <div
              ref={eyeContainerRef}
              style={{
                display: "flex", gap: "20px", marginTop: "-12px",
                position: "relative", zIndex: 2,
                willChange: "transform",
              }}
            >
              <div ref={eyeLeftRef}  className="ba-eye" />
              <div ref={eyeRightRef} className="ba-eye" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
