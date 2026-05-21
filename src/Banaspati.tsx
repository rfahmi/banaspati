/**
 * Banaspati
 * ---------
 * A self-contained animated teal blob avatar with:
 *   - Physics-based bounce & squash on click
 *   - Perlin-noise flame rendered on a canvas behind the sphere
 *   - Mouse-tracked eye movement + periodic blinking
 *   - Eight mood expressions controllable via prop
 *
 * Zero external dependencies — only React + a browser canvas.
 *
 * Usage:
 *   import Banaspati from "@rfahmi/banaspati";
 *
 *   <Banaspati mood="happy" flameAmplitude={50} sphereScale={1} />
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";


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

/** The nine available mood expressions. Controls eye shape. */
export type AvatarMood =
  | "idle"        // neutral, round eyes
  | "happy"       // bottom-clipped (smile-eyes)
  | "surprised"   // wide open, larger radius
  | "sleepy"      // top-clipped (half-closed)
  | "excited"     // slightly bottom-clipped, smaller radius
  | "suspicious"  // asymmetric top-clip (side-eye)
  | "angry"       // furrowed, narrowed eyes (V-brow)
  | "sad"         // drooping inner brow (inverted V)
  | "thinking";   // eyes shifted up-left, contemplative look

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

  /**
   * Multiplier for the soft glow/corona size and opacity around the flame.
   * Can be set to 0 to completely disable the outer glow so that the avatar
   * fits cleanly inside smaller container boundaries without edge cropping.
   * Range: 0–2  @default 1.0
   */
  flameGlowSpread?: number;

  // ── Gaze control ──────────────────────────────────────────────────────────

  /**
   * Whether the eyes automatically track the mouse cursor.
   * Set to `false` to disable cursor tracking (eyes stay centred or follow `lookAt`).
   * @default true
   */
  followCursor?: boolean;

  /**
   * Manually set the gaze direction when `followCursor` is `false`.
   * Both axes are normalised: -1 (full left / up) to 1 (full right / down).
   * `{ x: 0, y: 0 }` = looking straight ahead.
   * Ignored when `followCursor` is `true`.
   */
  lookAt?: { x: number; y: number };

  // ── Events ────────────────────────────────────────────────────────────────

  /**
   * Called when the user clicks the sphere.
   * The bounce animation always plays; use this for additional side-effects.
   */
  onClick?: () => void;

  /**
   * Fired on pointerdown on the sphere. Useful for implementing custom drag
   * in frameless Electron windows without conflicting with onClick.
   */
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;

  // ── Speech ──────────────────────────────────────────────────────────────

  /**
   * Text to display in a speech bubble above the avatar.
   * The bubble stays visible as long as a truthy string is set.
   * Pass an empty string, `undefined`, or `null` to dismiss it.
   */
  speech?: string;

  /**
   * Change this value to re-trigger the speech bubble even if the text
   * is the same as before (e.g. increment a counter).
   * @default undefined
   */
  speechKey?: string | number;

  /**
   * The base font size for the speech text in CSS pixels.
   * Scales proportionally with the character size.
   * @default 16
   */
  speechFontSize?: number;

  /**
   * Delay in milliseconds before the speech text starts disappearing after typing finishes.
   * @default 3000
   */
  speechDisappearDelay?: number;

  /**
   * The overall size of the avatar in CSS pixels.
   * Scales the sphere, eyes, flame, shadow, and bounce physics proportionally.
   * @default 160
   */
  size?: number;

  /**
   * Whether the overall size of the avatar should dynamically scale to fit
   * its parent container. If `true`, the avatar will automatically scale
   * based on the container dimensions.
   * @default false
   */
  responsive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal constants
// ─────────────────────────────────────────────────────────────────────────────

/** Rest Y position (0 = ground level). */
const GROUND_Y      = 0;


type EyeClip = { topL: number; topR: number; bot: number; radius: string; w: number; h: number };
const EYE_STATES: Record<AvatarMood, EyeClip> = {
  idle:       { topL: 0,  topR: 0,  bot: 0,  radius: "10px", w: 18, h: 30 },
  happy:      { topL: 0,  topR: 0,  bot: 50, radius: "10px", w: 20, h: 30 },
  surprised:  { topL: 0,  topR: 0,  bot: 0,  radius: "50%",  w: 28, h: 40 },
  sleepy:     { topL: 58, topR: 58, bot: 0,  radius: "10px", w: 22, h: 26 },
  excited:    { topL: 0,  topR: 0,  bot: 35, radius: "50%",  w: 22, h: 34 },
  suspicious: { topL: 0,  topR: 0,  bot: 0,  radius: "10px", w: 18, h: 30 },
  angry:      { topL: 0,  topR: 0,  bot: 0,  radius: "6px",  w: 18, h: 30 },
  sad:        { topL: 0,  topR: 0,  bot: 0,  radius: "10px", w: 18, h: 30 },
  thinking:   { topL: 0,  topR: 0,  bot: 0,  radius: "50%",  w: 16, h: 26 },
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
  flameGlowSpread = 1.0,
  followCursor   = true,
  lookAt,
  onClick,
  onPointerDown,
  speech,
  speechKey,
  speechFontSize = 16,
  speechDisappearDelay = 3000,
  size           = 160,
  responsive     = false,
}: BanaspatiProps) {
  const [observedSize, setObservedSize] = useState<number>(size);
  const responsiveContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize state with size prop if not in responsive mode
  useEffect(() => {
    if (!responsive) {
      setObservedSize(size);
    }
  }, [size, responsive]);

  // Resize observer to watch the parent container's dimensions
  useEffect(() => {
    if (!responsive || !responsiveContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Solves sceneSize = Math.min(width, height)
          // activeSize = sceneSize / 1.625
          const nextSize = Math.max(40, Math.min(width, height) / 1.625);
          setObservedSize(nextSize);
        }
      }
    });

    observer.observe(responsiveContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [responsive]);

  const activeSize   = responsive ? observedSize : size;
  const scaleFactor  = activeSize / 160;
  const ballSize     = activeSize;
  const bounceHeight = activeSize * (90 / 160);
  const flameCanvas  = activeSize * (320 / 160);
  const flameOffset  = (flameCanvas - ballSize) / 2;
  const gravity      = 2.8 * scaleFactor;



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
    glowSpread: flameGlowSpread,
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
    flameRef.current.glowSpread = flameGlowSpread;
  }, [flameAmplitude, flameIntensity, flameDrift, flameNoiseScale, flameUpwardBias, flameSpread, flameGlowSpread]);

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

  // Helper to scale border radius if it is in px (percentage values like "50%" remain unchanged)
  const getScaledRadius = (radius: string, sf: number) => {
    if (radius.endsWith("px")) {
      return `${parseFloat(radius) * sf}px`;
    }
    return radius;
  };

  // ── Apply eye shape from mood ──────────────────────────────────────────────
  const applyEyeMood = useCallback((m: AvatarMood) => {
    const s = EYE_STATES[m];
    // Reset any transform offset from "thinking" mood
    [eyeLeftRef.current, eyeRightRef.current].forEach(el => {
      if (el) el.style.transform = "";
    });
    // Apply size per mood (surprised = larger eyes)
    [eyeLeftRef.current, eyeRightRef.current].forEach(el => {
      if (el) {
        el.style.width = `${s.w * scaleFactor}px`;
        el.style.height = `${s.h * scaleFactor}px`;
      }
    });
    if (m === "angry") {
      // V-brow — inner edges slope downward
      if (eyeLeftRef.current) {
        eyeLeftRef.current.style.clipPath     = "polygon(0% 28%, 100% 52%, 100% 85%, 0% 85%)";
        eyeLeftRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
      if (eyeRightRef.current) {
        eyeRightRef.current.style.clipPath     = "polygon(0% 52%, 100% 28%, 100% 85%, 0% 85%)";
        eyeRightRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
    } else if (m === "sad") {
      // Inverted V — outer edges droop down, inner edges stay high
      if (eyeLeftRef.current) {
        eyeLeftRef.current.style.clipPath     = "polygon(0% 48%, 100% 24%, 100% 100%, 0% 100%)";
        eyeLeftRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
      if (eyeRightRef.current) {
        eyeRightRef.current.style.clipPath     = "polygon(0% 24%, 100% 48%, 100% 100%, 0% 100%)";
        eyeRightRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
    } else if (m === "suspicious") {
      // The Rock eyebrow raise — one eye wide open, the other squinting hard
      if (eyeLeftRef.current) {
        eyeLeftRef.current.style.width       = `${24 * scaleFactor}px`;
        eyeLeftRef.current.style.height      = `${36 * scaleFactor}px`;
        eyeLeftRef.current.style.clipPath    = `inset(0% 0% 0% 0%)`;
        eyeLeftRef.current.style.borderRadius = "50%";
      }
      if (eyeRightRef.current) {
        eyeRightRef.current.style.width       = `${18 * scaleFactor}px`;
        eyeRightRef.current.style.height      = `${28 * scaleFactor}px`;
        eyeRightRef.current.style.clipPath    = `inset(58% 0% 0% 0%)`;
        eyeRightRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
    } else if (m === "thinking") {
      // Contemplative look — eyes shift up-left, slight size difference
      [eyeLeftRef.current, eyeRightRef.current].forEach(el => {
        if (el) {
          el.style.width       = `${s.w * scaleFactor}px`;
          el.style.height      = `${s.h * scaleFactor}px`;
          el.style.clipPath    = `inset(0% 0% 0% 0%)`;
          el.style.borderRadius = s.radius;
          el.style.transform   = `translate(${-3 * scaleFactor}px, ${-4 * scaleFactor}px)`;
        }
      });
    } else {
      if (eyeLeftRef.current) {
        eyeLeftRef.current.style.clipPath     = `inset(${s.topL}% 0% ${s.bot}% 0%)`;
        eyeLeftRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
      if (eyeRightRef.current) {
        eyeRightRef.current.style.clipPath     = `inset(${s.topR}% 0% ${s.bot}% 0%)`;
        eyeRightRef.current.style.borderRadius = getScaledRadius(s.radius, scaleFactor);
      }
    }
  }, [scaleFactor]);

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

  // ── Live refs for gaze control ──────────────────────────────────────────────
  const followCursorRef = useRef(followCursor);
  const lookAtRef       = useRef(lookAt);

  useEffect(() => { followCursorRef.current = followCursor; }, [followCursor]);
  useEffect(() => {
    lookAtRef.current = lookAt;
    // When manually controlling, immediately update target eye
    if (!followCursorRef.current && lookAt) {
      targetEye.current = { x: lookAt.x * 28 * scaleFactor, y: lookAt.y * 22 * scaleFactor };
    }
  }, [lookAt?.x, lookAt?.y, scaleFactor]);

  // Reset gaze to centre when followCursor is toggled off without a lookAt
  useEffect(() => {
    if (!followCursor && !lookAt) {
      targetEye.current = { x: 0, y: 0 };
    }
  }, [followCursor, lookAt]);

  // ── Mouse tracking ─────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!followCursorRef.current) return;
    if (!ballRef.current) return;
    const rect = ballRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist  = Math.sqrt(dx * dx + dy * dy) || 1;
    const scale = Math.min(dist, ballSize * 2) / (ballSize * 2);
    targetEye.current = { x: (dx / dist) * 28 * scaleFactor * scale, y: (dy / dist) * 22 * scaleFactor * scale };
  }, [scaleFactor, ballSize]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ── Main physics rAF loop ──────────────────────────────────────────────────
  useEffect(() => {
    const EYE_LERP     = 0.10;
    const SQ_STIFFNESS = 0.30;
    const SQ_DAMPING   = 0.54;
    const JELLY_STIFF  = 0.28;
    const JELLY_DAMP   = 0.52;

    const tick = () => {
      const p = physRef.current;

      // 1. Bounce gravity
      if (p.y < GROUND_Y || p.vy < 0) { p.vy += gravity; p.y += p.vy; }
      if (p.y >= GROUND_Y) {
        const impact = Math.abs(p.vy);
        p.y = GROUND_Y; p.vy = 0;
        const scaledImpact = impact / scaleFactor;
        if (scaledImpact > 3) p.sqv += Math.min(scaledImpact * 0.018, 0.30);
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
      const heightRatio = Math.max(0, Math.min(1, heightAboveGround / bounceHeight));
      const sc = sphereScaleRef.current;

      if (wrapperRef.current)
        wrapperRef.current.style.transform = `translateY(${p.y}px)`;

      if (ballRef.current) {
        ballRef.current.style.transform =
          `scaleX(${squashX * p.jx * sc}) scaleY(${squashY * p.jy * sc})`;
        const coreAlpha = 0.12 + (1 - heightRatio) * 0.10;
        if (sphereBgRef.current)
          sphereBgRef.current.style.boxShadow =
            `inset 0 0 ${18 * scaleFactor}px ${4 * scaleFactor}px rgba(0,230,190,${coreAlpha.toFixed(3)})`;
      }

      // Ground shadow
      if (shadowRef.current) {
        const sW  = (60  + (1 - heightRatio) * 80) * scaleFactor;
        const sH  = (10  + (1 - heightRatio) * 14) * scaleFactor;
        const sOp = 0.15 + (1 - heightRatio) * 0.65;
        const sB  = (14  + (1 - heightRatio) * 18) * scaleFactor;
        shadowRef.current.style.width     = `${sW}px`;
        shadowRef.current.style.height    = `${sH}px`;
        shadowRef.current.style.opacity   = `${sOp}`;
        shadowRef.current.style.filter    = `blur(${sB}px)`;
        shadowRef.current.style.transform =
          `translateX(-50%) translateY(${-p.y}px)`;
      }

      // Eye container position
      if (eyeContainerRef.current)
        eyeContainerRef.current.style.transform = `translate(${ex.x}px, ${ex.y}px)`;

      // 3D perspective foreshortening — eyes sit on the sphere surface,
      // so the eye turning away from the viewer compresses horizontally.
      const eyeHalfGap = 16 * scaleFactor;                    // half of the 32 px CSS gap
      const perspR     = (ballSize / 2) * 0.85; // tighter radius → more visible effect
      const leftNorm   = (ex.x - eyeHalfGap) / perspR;
      const rightNorm  = (ex.x + eyeHalfGap) / perspR;
      const leftSX     = Math.sqrt(Math.max(0.01, 1 - leftNorm  * leftNorm));
      const rightSX    = Math.sqrt(Math.max(0.01, 1 - rightNorm * rightNorm));

      // Blink scale
      const blinkSY = blinkingRef.current ? 0.06 : 1;
      if (eyeLeftRef.current)
        eyeLeftRef.current.style.transform  = `scaleX(${leftSX.toFixed(3)}) scaleY(${blinkSY})`;
      if (eyeRightRef.current)
        eyeRightRef.current.style.transform = `scaleX(${rightSX.toFixed(3)}) scaleY(${blinkSY})`;

      frameRef.current = requestAnimationFrame(tick);
    };

    physRef.current.y = GROUND_Y;
    physRef.current.vy = 0;
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [scaleFactor, ballSize, bounceHeight, gravity]);

  // ── Flame canvas rAF loop ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = flameCanvasRef.current;
    if (!canvas) return;

    const dpr  = window.devicePixelRatio || 1;
    const SIZE = flameCanvas;
    canvas.width        = SIZE * dpr;
    canvas.height       = SIZE * dpr;
    canvas.style.width  = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const perlin       = buildPerlin();
    const sphereRadius = ballSize / 2;

    function drawFrame(ts: number) {
      const {
        amplitude:  rawAmplitude,
        intensity:  flameIntensity,
        drift:      upwardDrift,
        noiseScale,
        upwardBias,
        spread,
        glowSpread,
      } = flameRef.current;

      const flameAmplitude = rawAmplitude * scaleFactor;

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
      const gradR  = baseRadius + (flameAmplitude * 1.3) * glowSpread;

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

      // Soft ambient corona around the whole shape (only rendered if glowSpread > 0)
      if (glowSpread > 0) {
        ctx.globalCompositeOperation = "source-over";
        const coronaR = sphereRadius * (1.0 + 1.6 * glowSpread);
        const corona = ctx.createRadialGradient(cx, gradCY, sphereRadius, cx, gradCY, coronaR);
        corona.addColorStop(0,    `rgba(0,180,155,${(0.05  * flameIntensity * Math.min(glowSpread, 1.0)).toFixed(3)})`);
        corona.addColorStop(0.55, `rgba(0,140,125,${(0.022 * flameIntensity * Math.min(glowSpread, 1.0)).toFixed(3)})`);
        corona.addColorStop(1,    "rgba(0,100,90,0)");
        ctx.beginPath();
        ctx.arc(cx, gradCY, coronaR, 0, Math.PI * 2);
        ctx.fillStyle = corona;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      flameRafRef.current = requestAnimationFrame(drawFrame);
    }

    flameRafRef.current = requestAnimationFrame(drawFrame);
    return () => { if (flameRafRef.current) cancelAnimationFrame(flameRafRef.current); };
  }, [flameCanvas, ballSize, scaleFactor]);

  // ── Click handler ──────────────────────────────────────────────────────────
  const handleBlobClick = () => {
    if (physRef.current.y < -2) return; // ignore while already airborne
    physRef.current.y   = GROUND_Y;
    physRef.current.vy  = -Math.sqrt(2 * gravity * bounceHeight);
    physRef.current.jvx = 0.18;
    onClick?.();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scoped keyframe styles — injected once, harmless if component mounts multiple times */}
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
        .ba-eye {
          will-change: transform;
          transform-origin: center center;
          flex-shrink: 0;
          width: ${18 * scaleFactor}px; height: ${30 * scaleFactor}px;
          background: #ffffff;
          transition: clip-path 0.32s cubic-bezier(0.4,0,0.2,1),
                      border-radius 0.32s cubic-bezier(0.4,0,0.2,1),
                      width 0.32s cubic-bezier(0.4,0,0.2,1),
                      height 0.32s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>

      {/* Outer layout — vertically stacks avatar + speech bubble */}
      <div
        ref={responsiveContainerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: responsive ? "center" : undefined,
          width: responsive ? "100%" : undefined,
          height: responsive ? "100%" : undefined,
          boxSizing: "border-box",
        }}
      >
      {/* Scene container — sized to contain bounce headroom + shadow */}
      <div style={{
        position: "relative",
        width:  `${ballSize + 100 * scaleFactor}px`,
        height: `${ballSize + bounceHeight + 10 * scaleFactor}px`,
        userSelect: "none",
      }}>
        {/* Ground shadow — size & opacity driven by physics loop */}
        <div
          ref={shadowRef}
          style={{
            position: "absolute", bottom: `${10 * scaleFactor}px`, left: "50%",
            width: `${60 * scaleFactor}px`, height: `${10 * scaleFactor}px`,
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
            bottom: `${10 * scaleFactor}px`,
            left: "50%",
            marginLeft: `-${ballSize / 2}px`,
            width:  `${ballSize}px`,
            height: `${ballSize}px`,
            willChange: "transform",
          }}
        >
          {/* Flame canvas — larger than the sphere and centred behind it */}
          <canvas
            ref={flameCanvasRef}
            style={{
              position: "absolute",
              top:  `-${flameOffset}px`,
              left: `-${flameOffset}px`,
              width:  `${flameCanvas}px`,
              height: `${flameCanvas}px`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Sphere — scaleX/scaleY + sphereScale applied by physics loop */}
          <div
            ref={ballRef}
            onClick={handleBlobClick}
            onPointerDown={onPointerDown}
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
                boxShadow: `inset 0 0 ${18 * scaleFactor}px ${4 * scaleFactor}px rgba(0,230,190,0.12)`,
                opacity: sphereOpacity,
                pointerEvents: "none",
              }}
            />

            {/* Eyes — always fully opaque; z-index above sphere body */}
            <div
              ref={eyeContainerRef}
              style={{
                display: "flex", gap: `${32 * scaleFactor}px`, marginTop: `${-18 * scaleFactor}px`,
                position: "relative", zIndex: 2,
                willChange: "transform",
              }}
            >
              <div ref={eyeLeftRef}  className="ba-eye" />
              <div ref={eyeRightRef} className="ba-eye" />
            </div>
          </div>
        </div>

        {/* Speech bubble: outside wrapperRef so it doesn't bounce */}
        <FloatingText
          message={speech}
          speechKey={speechKey}
          scaleFactor={scaleFactor}
          fontSize={speechFontSize}
          disappearDelay={speechDisappearDelay}
        />
      </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter & Glitch Text Helpers
// ─────────────────────────────────────────────────────────────────────────────

const GLITCH_CHARS = "!@#$%^&*<>?/|\\~`ABCDEFabcdef01234";

function useTypewriter(text: string, speed = 45) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
    if (!text) return;

    const interval = setInterval(() => {
      if (indexRef.current >= text.length) {
        setDone(true);
        clearInterval(interval);
        return;
      }
      setDisplayed(text.slice(0, indexRef.current + 1));
      indexRef.current++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function GlitchText({ text, done }: { text: string; done: boolean }) {
  const [glitched, setGlitched] = useState(text);

  useEffect(() => {
    if (!done || !text) {
      setGlitched(text);
      return;
    }

    let runs = 0;
    const max = 6;
    const interval = setInterval(() => {
      runs++;
      if (runs >= max) {
        setGlitched(text);
        clearInterval(interval);
        return;
      }
      setGlitched(
        text.split("").map((ch) =>
          Math.random() < 0.12 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch
        ).join("")
      );
    }, 60);

    return () => clearInterval(interval);
  }, [done, text]);

  return <>{glitched}</>;
}

interface FloatingTextProps {
  message?: string;
  speechKey?: string | number;
  scaleFactor: number;
  fontSize: number;
  disappearDelay: number;
}

function FloatingText({ message, speechKey, scaleFactor, fontSize, disappearDelay }: FloatingTextProps) {
  const { displayed, done } = useTypewriter(message || "", 40);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const lines = displayed.split("\n");
  
  // Clamp font size to ensure readability at small avatar sizes
  const scaledFontSize = Math.max(10, fontSize * scaleFactor);
  const scaledIconSize = Math.max(7.5, (fontSize * 0.75) * scaleFactor);
  const scaledCursorWidth = Math.max(6, (fontSize * 0.6) * scaleFactor);
  const scaledCursorHeight = Math.max(10, fontSize * scaleFactor);

  useEffect(() => {
    setVisible(true);
    setFading(false);
    if (!message) return;
    const hold = message.length * 40 + disappearDelay;
    const t1 = setTimeout(() => setFading(true), hold);
    const t2 = setTimeout(() => setVisible(false), hold + 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [message, speechKey, disappearDelay]);

  if (!visible || !message) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: `calc(100% + ${24 * scaleFactor}px)`,
        left: "50%",
        transform: "translateX(-50%)",
        whiteSpace: "pre",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: `${scaledFontSize}px`,
        letterSpacing: "0.08em",
        lineHeight: "1.65",
        color: "#7effd4",
        textShadow: "0 0 8px #3fffc0, 0 0 22px #00ffaa55",
        pointerEvents: "none",
        userSelect: "none",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease",
        zIndex: 20,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: `${6 * scaleFactor}px`, justifyContent: "center" }}>
          <span style={{ color: "#3fffc088", fontSize: `${scaledIconSize}px` }}>
            {i === lines.length - 1 && !done ? "›" : "·"}
          </span>
          <GlitchText text={line} done={done} />
          {i === lines.length - 1 && !done && (
            <span style={{
              display: "inline-block",
              width: `${scaledCursorWidth}px`,
              height: `${scaledCursorHeight}px`,
              background: "#7effd4",
              boxShadow: "0 0 6px #3fffc0",
              animation: "ba-blink 0.7s step-end infinite",
              marginLeft: `${2 * scaleFactor}px`,
            }} />
          )}
        </div>
      ))}

      {/* scanline overlay on text */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,170,0.03) 2px, rgba(0,255,170,0.03) 4px)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

