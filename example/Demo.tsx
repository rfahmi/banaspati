import { useState } from "react";
import Banaspati, { type AvatarMood } from "../src";
import {
  colors,
  fontSizes,
  spacing,
  panelStyle,
  sectionLabelStyle,
  HudPage,
  PanelCorners,
  PanelHeader,
  HudTextField,
  HudToggle,
  HudTrackpad,
  useClock,
  useWindowWidth,
} from "@rfahmi/rfui";

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
  const [speech, setSpeech] = useState("");
  const [speechKey, setSpeechKey] = useState(0);
  const [speechInput, setSpeechInput] = useState("");
  const [followCursor, setFollowCursor] = useState(true);
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        speech: "",
        mood: "",
        visualState: {
          scale: null,
          opacity: null,
          flameAmplitude: null,
          flameIntensity: null,
          flameDrift: null,
          flameNoiseScale: null,
          flameUpwardBias: null,
          flameSpread: null,
          gaze: { x: null, y: null, z: null },
        },
      },
      null,
      2
    )
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const VALID_MOODS: AvatarMood[] = ["idle", "happy", "surprised", "sleepy", "excited", "suspicious", "angry", "sad", "thinking"];

  const applyJson = (raw: string) => {
    try {
      const data = JSON.parse(raw);
      setJsonError(null);

      if (data.mood && typeof data.mood === "string") {
        if (VALID_MOODS.includes(data.mood as AvatarMood)) {
          setMood(data.mood as AvatarMood);
        } else {
          setJsonError(`Unknown mood "${data.mood}". Valid: ${VALID_MOODS.join(", ")}`);
          return;
        }
      }
      if (data.speech && typeof data.speech === "string") {
        setSpeech(data.speech);
        setSpeechKey((k) => k + 1);
      }

      const vs = data.visualState;
      if (vs) {
        if (vs.scale != null)          setSphereScale(vs.scale);
        if (vs.opacity != null)        setSphereOpacity(vs.opacity);
        if (vs.flameAmplitude != null) setFlameAmplitude(vs.flameAmplitude);
        if (vs.flameIntensity != null) setFlameIntensity(vs.flameIntensity);
        if (vs.flameDrift != null)     setFlameDrift(vs.flameDrift);
        if (vs.flameNoiseScale != null) setFlameNoiseScale(vs.flameNoiseScale);
        if (vs.flameUpwardBias != null) setFlameUpwardBias(vs.flameUpwardBias);
        if (vs.flameSpread != null)    setFlameSpread(vs.flameSpread);

        if (vs.gaze && (vs.gaze.x != null || vs.gaze.y != null)) {
          setFollowCursor(false);
          setLookAt({
            x: vs.gaze.x ?? 0,
            y: vs.gaze.y ?? 0,
          });
        }
      }
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const clock = useClock();
  const { isMobile } = useWindowWidth();

  const presets = {
    default:  { mood: "idle"    as AvatarMood, sphereOpacity: 1,   sphereScale: 1,   flameAmplitude: 40, flameIntensity: 1.0, flameDrift: 1.0, flameNoiseScale: 1.5, flameUpwardBias: 0.85, flameSpread: 2.2 },
    ghost:    { mood: "sleepy"  as AvatarMood, sphereOpacity: 0.3, sphereScale: 1,   flameAmplitude: 30, flameIntensity: 1.8, flameDrift: 0.5, flameNoiseScale: 1.5, flameUpwardBias: 0.85, flameSpread: 2.2 },
    dramatic: { mood: "excited" as AvatarMood, sphereOpacity: 1,   sphereScale: 1.5, flameAmplitude: 70, flameIntensity: 2.0, flameDrift: 2.5, flameNoiseScale: 2.0, flameUpwardBias: 1.2,  flameSpread: 1.8 },
    minimal:  { mood: "idle"    as AvatarMood, sphereOpacity: 1,   sphereScale: 0.8, flameAmplitude: 20, flameIntensity: 0.5, flameDrift: 0.5, flameNoiseScale: 1.0, flameUpwardBias: 0.6,  flameSpread: 3.0 },
    rage:     { mood: "angry"   as AvatarMood, sphereOpacity: 1,   sphereScale: 1.2, flameAmplitude: 80, flameIntensity: 2.0, flameDrift: 3.0, flameNoiseScale: 2.5, flameUpwardBias: 1.4,  flameSpread: 1.2 },
  };

  const applyPreset = (name: keyof typeof presets) => {
    const p = presets[name];
    setMood(p.mood); setSphereOpacity(p.sphereOpacity); setSphereScale(p.sphereScale);
    setFlameAmplitude(p.flameAmplitude); setFlameIntensity(p.flameIntensity);
    setFlameDrift(p.flameDrift); setFlameNoiseScale(p.flameNoiseScale);
    setFlameUpwardBias(p.flameUpwardBias); setFlameSpread(p.flameSpread);
  };

  const sliders = [
    { label: "Sphere Opacity",    value: sphereOpacity,   set: setSphereOpacity,   min: 0,   max: 1,   step: 0.1  },
    { label: "Sphere Scale",      value: sphereScale,     set: setSphereScale,     min: 0.5, max: 2,   step: 0.1  },
    { label: "Flame Amplitude",   value: flameAmplitude,  set: setFlameAmplitude,  min: 0,   max: 80,  step: 5    },
    { label: "Flame Intensity",   value: flameIntensity,  set: setFlameIntensity,  min: 0,   max: 2,   step: 0.1  },
    { label: "Flame Drift",       value: flameDrift,      set: setFlameDrift,      min: 0,   max: 3,   step: 0.1  },
    { label: "Flame Noise Scale", value: flameNoiseScale, set: setFlameNoiseScale, min: 0.3, max: 3,   step: 0.1  },
    { label: "Flame Upward Bias", value: flameUpwardBias, set: setFlameUpwardBias, min: 0,   max: 1.5, step: 0.05 },
    { label: "Flame Spread",      value: flameSpread,     set: setFlameSpread,     min: 0.5, max: 4,   step: 0.1  },
  ];

  return (
    <HudPage style={{ padding: isMobile ? `${spacing.lg}px ${spacing.md}px` : `${spacing.xxl}px ${spacing.xl}px` }}>

      {/* Header */}
      <header style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? spacing.md : 0, marginBottom: spacing.xxl, paddingBottom: spacing.lg, borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <h1 style={{ fontSize: isMobile ? fontSizes.xl : fontSizes.xxl, margin: 0, color: colors.hi, letterSpacing: "0.12em", fontWeight: 400 }}>BANASPATI</h1>
          <p style={{ fontSize: fontSizes.xs, color: colors.dim, margin: `${spacing.xs}px 0 0`, textTransform: "uppercase", letterSpacing: "0.25em" }}>RFUI v1.0.0</p>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, color: colors.hi, fontWeight: 400, fontVariantNumeric: "tabular-nums" }}>{clock}</div>
          <div style={{ fontSize: fontSizes.xs, color: colors.dim, marginTop: spacing.xs, letterSpacing: "0.15em" }}>SYS:ONLINE ● LINK:ACTIVE</div>
        </div>
      </header>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: spacing.xl, alignItems: "start" }}>

        {/* Entity Viewer */}
        <div style={panelStyle}>
          <PanelCorners />
          <PanelHeader>Entity Viewer</PanelHeader>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.lg }}>
            <Banaspati
              mood={mood}
              sphereOpacity={sphereOpacity} sphereScale={sphereScale}
              flameAmplitude={flameAmplitude} flameIntensity={flameIntensity}
              flameDrift={flameDrift} flameNoiseScale={flameNoiseScale}
              flameUpwardBias={flameUpwardBias} flameSpread={flameSpread}
              speech={speech || undefined}
              speechKey={speechKey}
              followCursor={followCursor}
              lookAt={followCursor ? undefined : lookAt}
              onClick={() => {
                setClickCount((c) => c + 1);
                setMood("excited");
                setTimeout(() => setMood("happy"), 500);
                setTimeout(() => setMood("idle"), 1500);
              }}
            />
          </div>
          <div style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${spacing.sm}px ${spacing.lg}px`, fontSize: fontSizes.xs }}>
            {[
              ["STATUS",       mood.toUpperCase()],
              ["INTERACTIONS", clickCount.toString().padStart(4, "0")],
              ["OPACITY",      sphereOpacity.toFixed(1)],
              ["SCALE",        sphereScale.toFixed(1)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: colors.dim, letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ color: colors.hi, fontWeight: 400 }}>{val}</span>
              </div>
            ))}
          </div>
          {/* Speech input */}
          <div style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
            <HudTextField
              label="Speech"
              value={speechInput}
              onChange={setSpeechInput}
              placeholder="Type something…"
              submitLabel="SAY"
              onSubmit={() => {
                if (speechInput.trim()) {
                  setSpeech(speechInput.trim());
                  setSpeechKey((k) => k + 1);
                }
              }}
            />
            <button
              onClick={() => {
                setSpeechInput("");
                setSpeech("");
                setSpeechKey((k) => k + 1);
                applyPreset("default");
              }}
              style={{
                marginTop: spacing.sm,
                padding: `${spacing.sm}px ${spacing.lg}px`,
                background: "rgba(120,160,200,0.06)",
                color: colors.hi,
                border: `1px solid ${colors.border}`,
                cursor: "pointer",
                fontWeight: 400,
                textTransform: "uppercase",
                fontFamily: "inherit",
                fontSize: fontSizes.xs,
                letterSpacing: "0.1em",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.14)"; e.currentTarget.style.borderColor = colors.borderHi; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.06)"; e.currentTarget.style.borderColor = colors.border; }}
            >
              Clear
            </button>
          </div>
          <p style={{ textAlign: "center", margin: `${spacing.lg}px 0 0`, fontSize: fontSizes.xs, color: colors.dim, letterSpacing: "0.15em" }}>▸ CLICK ENTITY TO INTERACT</p>
        </div>

        {/* Control Panel */}
        <div style={panelStyle}>
          <PanelCorners />
          <PanelHeader>Control Panel</PanelHeader>

          {/* JSON Command */}
          <div style={{ marginBottom: spacing.xl }}>
            <label style={sectionLabelStyle}>▸ JSON Command</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={14}
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                border: `1px solid ${jsonError ? "#ff6b6b" : colors.border}`,
                background: "rgba(8,16,32,0.9)",
                color: colors.hi,
                fontSize: fontSizes.xs,
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {jsonError && (
              <div style={{ color: "#ff6b6b", fontSize: fontSizes.xs, marginTop: spacing.xs }}>
                ⚠ {jsonError}
              </div>
            )}
            <button
              onClick={() => applyJson(jsonInput)}
              style={{
                marginTop: spacing.sm,
                padding: `${spacing.sm}px ${spacing.lg}px`,
                background: "rgba(120,160,200,0.06)",
                color: colors.hi,
                border: `1px solid ${colors.border}`,
                cursor: "pointer",
                fontWeight: 400,
                textTransform: "uppercase",
                fontFamily: "inherit",
                fontSize: fontSizes.xs,
                letterSpacing: "0.1em",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.14)"; e.currentTarget.style.borderColor = colors.borderHi; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.06)"; e.currentTarget.style.borderColor = colors.border; }}
            >
              Apply JSON
            </button>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: spacing.xl }}>
            <label style={sectionLabelStyle}>▸ Presets</label>
            <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
              {Object.keys(presets).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name as keyof typeof presets)}
                  style={{ padding: `${spacing.sm}px ${spacing.lg}px`, background: "rgba(120,160,200,0.06)", color: colors.hi, border: `1px solid ${colors.border}`, cursor: "pointer", fontWeight: 400, textTransform: "uppercase", fontFamily: "inherit", fontSize: fontSizes.xs, letterSpacing: "0.1em", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.14)"; e.currentTarget.style.borderColor = colors.borderHi; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.06)"; e.currentTarget.style.borderColor = colors.border; }}
                >{name}</button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div style={{ marginBottom: spacing.xl }}>
            <label style={sectionLabelStyle}>▸ Mood <span style={{ color: colors.mid }}>{mood}</span></label>
            <select value={mood} onChange={(e) => setMood(e.target.value as AvatarMood)}
              style={{ width: "100%", padding: `${spacing.sm}px ${spacing.md}px`, border: `1px solid ${colors.border}`, background: "rgba(8,16,32,0.9)", color: colors.hi, fontSize: fontSizes.sm, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
              {(["idle", "happy", "surprised", "sleepy", "excited", "suspicious", "angry", "sad", "thinking"] as AvatarMood[]).map((m) => (
                <option key={m} value={m} style={{ background: colors.bg }}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>
          {/* Gaze Control */}
          <div style={{ marginBottom: spacing.xl }}>
            <label style={sectionLabelStyle}>▸ Gaze Control</label>
            <HudToggle
              value={followCursor}
              onChange={setFollowCursor}
              label="FOLLOW CURSOR"
              offLabel="MANUAL"
              style={{ marginBottom: spacing.md }}
            />
            {!followCursor && (
              <HudTrackpad
                value={lookAt}
                onChange={setLookAt}
              />
            )}
          </div>
          {/* Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
            {sliders.map((s) => {
              const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
              return (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
                    <span style={{ color: colors.dim, fontSize: fontSizes.xs, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                    <span style={{ color: colors.hi, fontSize: fontSizes.xs, fontWeight: 400, fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "right" }}>{s.value.toFixed(2)}</span>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "rgba(120,160,200,0.06)", border: `1px solid ${colors.border}` }}>
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: colors.mid, transition: "width 0.15s" }} />
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                      onChange={(e) => s.set(parseFloat(e.target.value))}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", margin: 0 }} />
                  </div>
                  <div style={{ marginTop: 3, fontSize: fontSizes.xs, lineHeight: 1, userSelect: "none" }}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <span key={i} style={{ color: (i / 20) * 100 < pct ? colors.dim : "rgba(120,160,200,0.1)", transition: "color 0.15s" }}>▮</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? spacing.sm : 0, marginTop: spacing.xxl, paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}`, fontSize: fontSizes.xs, color: colors.dim, letterSpacing: "0.12em" }}>
        <span>◆ BANASPATI SYSTEM ONLINE</span>
        <div style={{ display: "flex", gap: spacing.lg }}>
          <a href="https://github.com/rfahmi/banaspati" style={{ color: colors.mid, textDecoration: "none" }}>GITHUB</a>
          <a href="https://www.npmjs.com/package/@rfahmi/banaspati" style={{ color: colors.mid, textDecoration: "none" }}>NPM</a>
        </div>
        <span>v1.0.0</span>
      </footer>
    </HudPage>
  );
}
