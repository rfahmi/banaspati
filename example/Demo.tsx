import { useState, useEffect } from "react";
import Banaspati, { type AvatarMood } from "../src";

/* ── Design Tokens ─────────────────────────────────────── */
const C = {
  bg:       "#0a0f1e",
  panel:    "rgba(12, 22, 42, 0.75)",
  hi:       "#c8d8ec",
  mid:      "#7a90a8",
  dim:      "#3e5068",
  text:     "#9aacbf",
  border:   "rgba(120, 160, 200, 0.2)",
  borderHi: "rgba(160, 190, 220, 0.35)",
} as const;

const F = {
  xs: "0.65rem",
  sm: "0.75rem",
  base: "0.85rem",
  lg: "1rem",
  xl: "1.25rem",
  xxl: "2rem",
  title: "2.5rem",
} as const;

const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/* ── Reusable style fragments ──────────────────────── */
const panelStyle: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  padding: SPACE.xl,
  position: "relative",
};

const cornerStyle = (
  pos: Record<string, number | string>,
): React.CSSProperties => ({
  position: "absolute",
  ...pos,
  width: 12,
  height: 12,
  ...(pos.top !== undefined && pos.left !== undefined && { borderTop: `1px solid ${C.borderHi}`, borderLeft: `1px solid ${C.borderHi}` }),
  ...(pos.top !== undefined && pos.right !== undefined && { borderTop: `1px solid ${C.borderHi}`, borderRight: `1px solid ${C.borderHi}` }),
  ...(pos.bottom !== undefined && pos.left !== undefined && { borderBottom: `1px solid ${C.borderHi}`, borderLeft: `1px solid ${C.borderHi}` }),
  ...(pos.bottom !== undefined && pos.right !== undefined && { borderBottom: `1px solid ${C.borderHi}`, borderRight: `1px solid ${C.borderHi}` }),
});

const sectionLabel: React.CSSProperties = {
  display: "block",
  marginBottom: SPACE.sm,
  fontWeight: 400,
  color: C.hi,
  textTransform: "uppercase",
  fontSize: F.xs,
  letterSpacing: "0.1em",
};

const PanelCorners = () => (
  <>
    <div style={cornerStyle({ top: 6, left: 6 })} />
    <div style={cornerStyle({ top: 6, right: 6 })} />
    <div style={cornerStyle({ bottom: 6, left: 6 })} />
    <div style={cornerStyle({ bottom: 6, right: 6 })} />
  </>
);

const PanelHeader = ({ children }: { children: string }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: SPACE.sm,
    marginBottom: SPACE.xl,
    paddingBottom: SPACE.md,
    borderBottom: `1px solid ${C.border}`,
  }}>
    <span style={{ color: C.dim, fontSize: F.xs }}>◆</span>
    <span style={{
      color: C.hi,
      fontSize: F.base,
      fontWeight: 400,
      textTransform: "uppercase",
      letterSpacing: "0.15em",
    }}>
      {children}
    </span>
  </div>
);

/**
 * Interactive Demo for Banaspati Component
 *
 * Cyberpunk hacker HUD interface showcasing all customizable
 * properties and interactions of the Banaspati avatar.
 */
export default function Demo() {
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [sphereOpacity, setSphereOpacity] = useState(1);
  const [sphereScale, setSphereScale] = useState(1);
  const [flameAmplitude, setFlameAmplitude] = useState(40);
  const [flameIntensity, setFlameIntensity] = useState(1.0);
  const [flameDrift, setFlameDrift] = useState(1.0);
  const [flameNoiseScale, setFlameNoiseScale] = useState(1.5);
  const [flameUpwardBias, setFlameUpwardBias] = useState(0.85);
  const [flameSpread, setFlameSpread] = useState(2.2);
  const [clickCount, setClickCount] = useState(0);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const presets = {
    default: {
      mood: "idle" as AvatarMood,
      sphereOpacity: 1,
      sphereScale: 1,
      flameAmplitude: 40,
      flameIntensity: 1.0,
      flameDrift: 1.0,
      flameNoiseScale: 1.5,
      flameUpwardBias: 0.85,
      flameSpread: 2.2,
    },
    ghost: {
      mood: "sleepy" as AvatarMood,
      sphereOpacity: 0.3,
      sphereScale: 1,
      flameAmplitude: 30,
      flameIntensity: 1.8,
      flameDrift: 0.5,
      flameNoiseScale: 1.5,
      flameUpwardBias: 0.85,
      flameSpread: 2.2,
    },
    dramatic: {
      mood: "excited" as AvatarMood,
      sphereOpacity: 1,
      sphereScale: 1.5,
      flameAmplitude: 70,
      flameIntensity: 2.0,
      flameDrift: 2.5,
      flameNoiseScale: 2.0,
      flameUpwardBias: 1.2,
      flameSpread: 1.8,
    },
    minimal: {
      mood: "idle" as AvatarMood,
      sphereOpacity: 1,
      sphereScale: 0.8,
      flameAmplitude: 20,
      flameIntensity: 0.5,
      flameDrift: 0.5,
      flameNoiseScale: 1.0,
      flameUpwardBias: 0.6,
      flameSpread: 3.0,
    },
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setMood(preset.mood);
    setSphereOpacity(preset.sphereOpacity);
    setSphereScale(preset.sphereScale);
    setFlameAmplitude(preset.flameAmplitude);
    setFlameIntensity(preset.flameIntensity);
    setFlameDrift(preset.flameDrift);
    setFlameNoiseScale(preset.flameNoiseScale);
    setFlameUpwardBias(preset.flameUpwardBias);
    setFlameSpread(preset.flameSpread);
  };

  const sliders = [
    { label: "Sphere Opacity", value: sphereOpacity, set: setSphereOpacity, min: 0, max: 1, step: 0.1 },
    { label: "Sphere Scale", value: sphereScale, set: setSphereScale, min: 0.5, max: 2, step: 0.1 },
    { label: "Flame Amplitude", value: flameAmplitude, set: setFlameAmplitude, min: 0, max: 80, step: 5 },
    { label: "Flame Intensity", value: flameIntensity, set: setFlameIntensity, min: 0, max: 2, step: 0.1 },
    { label: "Flame Drift", value: flameDrift, set: setFlameDrift, min: 0, max: 3, step: 0.1 },
    { label: "Flame Noise Scale", value: flameNoiseScale, set: setFlameNoiseScale, min: 0.3, max: 3, step: 0.1 },
    { label: "Flame Upward Bias", value: flameUpwardBias, set: setFlameUpwardBias, min: 0, max: 1.5, step: 0.05 },
    { label: "Flame Spread", value: flameSpread, set: setFlameSpread, min: 0.5, max: 4, step: 0.1 },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      padding: `${SPACE.xxl}px ${SPACE.xl}px`,
      fontFamily: "'Consolas', 'SF Mono', 'Fira Code', 'Courier New', monospace",
      fontSize: F.sm,
      lineHeight: 1.55,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ── Background layers ──────────────────────── */}
      {/* Dotted grid */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(100,150,200,0.15) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        pointerEvents: "none",
      }} />
      {/* Ambient gradient light — top-center cool blue */}
      <div style={{
        position: "fixed", inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30, 60, 100, 0.35) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(20, 50, 90, 0.2) 0%, transparent 60%)
        `,
        pointerEvents: "none",
      }} />
      {/* Vignette — dark edges */}
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ────────────────────────────────── */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: SPACE.xxl,
          paddingBottom: SPACE.lg,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <h1 style={{
              fontSize: F.xxl,
              margin: 0,
              color: C.hi,
              letterSpacing: "0.12em",
              fontWeight: 400,
            }}>
              BANASPATI
            </h1>
            <p style={{
              fontSize: F.xs,
              color: C.dim,
              margin: `${SPACE.xs}px 0 0`,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
            }}>
              RFUI v1.0.0
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: F.lg,
              color: C.hi,
              fontWeight: 400,
              fontVariantNumeric: "tabular-nums",
            }}>
              {clock}
            </div>
            <div style={{ fontSize: F.xs, color: C.dim, marginTop: SPACE.xs, letterSpacing: "0.15em" }}>
              SYS:ONLINE ● LINK:ACTIVE
            </div>
          </div>
        </header>

        {/* ── Main grid ─────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: SPACE.xl,
          alignItems: "start",
        }}>

          {/* ── Left: Entity Viewer ─────────────────── */}
          <div style={panelStyle}>
            <PanelCorners />
            <PanelHeader>Entity Viewer</PanelHeader>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: SPACE.lg,
            }}>
              <Banaspati
                mood={mood}
                sphereOpacity={sphereOpacity}
                sphereScale={sphereScale}
                flameAmplitude={flameAmplitude}
                flameIntensity={flameIntensity}
                flameDrift={flameDrift}
                flameNoiseScale={flameNoiseScale}
                flameUpwardBias={flameUpwardBias}
                flameSpread={flameSpread}
                onClick={() => {
                  setClickCount((c) => c + 1);
                  setMood("excited");
                  setTimeout(() => setMood("happy"), 500);
                  setTimeout(() => setMood("idle"), 1500);
                }}
              />
            </div>

            {/* Status readout */}
            <div style={{
              marginTop: SPACE.xl,
              paddingTop: SPACE.lg,
              borderTop: `1px solid ${C.border}`,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `${SPACE.sm}px ${SPACE.lg}px`,
              fontSize: F.xs,
            }}>
              {[
                ["STATUS", mood.toUpperCase()],
                ["INTERACTIONS", clickCount.toString().padStart(4, "0")],
                ["OPACITY", sphereOpacity.toFixed(1)],
                ["SCALE", sphereScale.toFixed(1)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.dim, letterSpacing: "0.1em" }}>{label}</span>
                  <span style={{ color: C.hi, fontWeight: 400 }}>{val}</span>
                </div>
              ))}
            </div>

            <p style={{
              textAlign: "center",
              margin: `${SPACE.lg}px 0 0`,
              fontSize: F.xs,
              color: C.dim,
              letterSpacing: "0.15em",
            }}>
              ▸ CLICK ENTITY TO INTERACT
            </p>
          </div>

          {/* ── Right: Control Panel ────────────────── */}
          <div style={panelStyle}>
            <PanelCorners />
            <PanelHeader>Control Panel</PanelHeader>

            {/* Presets */}
            <div style={{ marginBottom: SPACE.xl }}>
              <label style={sectionLabel}>▸ Presets</label>
              <div style={{ display: "flex", gap: SPACE.sm, flexWrap: "wrap" }}>
                {Object.keys(presets).map((name) => (
                  <button
                    key={name}
                    onClick={() => applyPreset(name as keyof typeof presets)}
                    style={{
                      padding: `${SPACE.sm}px ${SPACE.lg}px`,
                      background: "rgba(120, 160, 200, 0.06)",
                      color: C.hi,
                      border: `1px solid ${C.border}`,
                      cursor: "pointer",
                      fontWeight: 400,
                      textTransform: "uppercase",
                      fontFamily: "inherit",
                      fontSize: F.xs,
                      letterSpacing: "0.1em",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(120, 160, 200, 0.14)";
                      e.currentTarget.style.borderColor = C.borderHi;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(120, 160, 200, 0.06)";
                      e.currentTarget.style.borderColor = C.border;
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood selector */}
            <div style={{ marginBottom: SPACE.xl }}>
              <label style={sectionLabel}>
                ▸ Mood&ensp;<span style={{ color: C.mid }}>{mood}</span>
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as AvatarMood)}
                style={{
                  width: "100%",
                  padding: `${SPACE.sm}px ${SPACE.md}px`,
                  border: `1px solid ${C.border}`,
                  background: "rgba(8, 16, 32, 0.9)",
                  color: C.hi,
                  fontSize: F.sm,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {(["idle", "happy", "surprised", "sleepy", "excited", "suspicious"] as AvatarMood[]).map((m) => (
                  <option key={m} value={m} style={{ background: C.bg }}>{m.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: SPACE.lg }}>
              {sliders.map((s) => {
                const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
                return (
                  <div key={s.label}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: SPACE.xs,
                    }}>
                      <span style={{
                        color: C.dim,
                        fontSize: F.xs,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}>
                        {s.label}
                      </span>
                      <span style={{
                        color: C.hi,
                        fontSize: F.xs,
                        fontWeight: 400,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 48,
                        textAlign: "right",
                      }}>
                        {s.value.toFixed(2)}
                      </span>
                    </div>

                    {/* Track */}
                    <div style={{
                      position: "relative",
                      height: 6,
                      background: "rgba(120, 160, 200, 0.06)",
                      border: `1px solid ${C.border}`,
                    }}>
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0, bottom: 0,
                        width: `${pct}%`,
                        background: C.mid,
                        transition: "width 0.15s",
                      }} />
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.value}
                        onChange={(e) => s.set(parseFloat(e.target.value))}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                          margin: 0,
                        }}
                      />
                    </div>

                    {/* Block bar */}
                    <div style={{
                      marginTop: 3,
                      fontSize: F.xs,
                      lineHeight: 1,
                      userSelect: "none",
                    }}>
                      {Array.from({ length: 20 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            color: (i / 20) * 100 < pct ? C.dim : "rgba(120, 160, 200, 0.1)",
                            transition: "color 0.15s",
                          }}
                        >
                          ▮
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────── */}
        <footer style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: SPACE.xxl,
          paddingTop: SPACE.lg,
          borderTop: `1px solid ${C.border}`,
          fontSize: F.xs,
          color: C.dim,
          letterSpacing: "0.12em",
        }}>
          <span>◆ BANASPATI SYSTEM ONLINE</span>
          <div style={{ display: "flex", gap: SPACE.lg }}>
            <a
              href="https://github.com/rfahmi/banaspati"
              style={{ color: C.mid, textDecoration: "none" }}
            >
              GITHUB
            </a>
            <a
              href="https://www.npmjs.com/package/@rfahmi/banaspati"
              style={{ color: C.mid, textDecoration: "none" }}
            >
              NPM
            </a>
          </div>
          <span>v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
