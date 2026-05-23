import { useState, useEffect } from "react";
import { BanaspatiV2 } from "../src";
import {
  colors,
  fontSizes,
  spacing,
  panelStyle,
  sectionLabelStyle,
  HudPage,
  PanelCorners,
  PanelHeader,
  HudToggle,
  HudTrackpad,
  useClock,
  useWindowWidth,
} from "@rfahmi/rfui";

export default function Demo() {

  // V2 Props
  const [v2Color, setV2Color] = useState("#10c8a8");
  const [v2Wind, setV2Wind] = useState(0);
  const [v2RiseSpeed, setV2RiseSpeed] = useState(1);
  const [v2Size, setV2Size] = useState(1.2);
  const [v2Turbulence, setV2Turbulence] = useState(25);
  const [v2NoiseFreq, setV2NoiseFreq] = useState(0.015);
  const [v2SparkCount, setV2SparkCount] = useState(12);

  const [v2ShowFace, setV2ShowFace] = useState(true);
  const [v2FaceColor, setV2FaceColor] = useState("#ffffff");
  const [v2EyeSpacing, setV2EyeSpacing] = useState(16);
  const [v2EyeSize, setV2EyeSize] = useState(5);
  const [v2EyeSquint, setV2EyeSquint] = useState(0);
  const [v2EyeTilt, setV2EyeTilt] = useState(0);
  const [v2MouthWidth, setV2MouthWidth] = useState(8);
  const [v2MouthOpen, setV2MouthOpen] = useState(0);
  const [v2MouthSmile, setV2MouthSmile] = useState(6);
  const [v2MouthY, setV2MouthY] = useState(14);
  const [clickCount, setClickCount] = useState(0);
  const [speech, setSpeech] = useState("");
  const [speechKey, setSpeechKey] = useState(0);
  const [speechInput, setSpeechInput] = useState("");
  const [followCursor, setFollowCursor] = useState(true);
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(160);
  const [responsive, setResponsive] = useState(false);
  const [speechFontSize, setSpeechFontSize] = useState(16);
  const [speechDisappearDelay, setSpeechDisappearDelay] = useState(3000);
  const [jsonInput, setJsonInput] = useState("");

  useEffect(() => {
    setJsonInput(
      JSON.stringify(
        {
          speech: speech,
          expression: {
            showFace: v2ShowFace,
            faceColor: v2FaceColor,
            eyeSpacing: v2EyeSpacing,
            eyeSize: v2EyeSize,
            eyeSquint: v2EyeSquint,
            eyeTilt: v2EyeTilt,
            mouthWidth: v2MouthWidth,
            mouthOpen: v2MouthOpen,
            mouthSmile: v2MouthSmile,
            mouthY: v2MouthY,
          },
          visualState: {
            v2Color,
            v2Size,
            v2Wind,
            v2RiseSpeed,
            v2Turbulence,
            v2NoiseFreq,
            v2SparkCount,
          },
        },
        null,
        2
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    speech, v2ShowFace, v2FaceColor, v2EyeSpacing, v2EyeSize, v2EyeSquint, v2EyeTilt,
    v2MouthWidth, v2MouthOpen, v2MouthSmile, v2MouthY,
    v2Color, v2Size, v2Wind, v2RiseSpeed, v2Turbulence, v2NoiseFreq, v2SparkCount
  ]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const applyJson = (raw: string) => {
    try {
      const data = JSON.parse(raw);
      setJsonError(null);
      if (data.speech && typeof data.speech === "string") {
        setSpeech(data.speech);
        setSpeechKey((k) => k + 1);
      }

      const expr = data.expression;
      if (expr) {
        if (expr.showFace != null)   setV2ShowFace(expr.showFace);
        if (expr.faceColor != null)  setV2FaceColor(expr.faceColor);
        if (expr.eyeSpacing != null) setV2EyeSpacing(expr.eyeSpacing);
        if (expr.eyeSize != null)    setV2EyeSize(expr.eyeSize);
        if (expr.eyeSquint != null)  setV2EyeSquint(expr.eyeSquint);
        if (expr.eyeTilt != null)    setV2EyeTilt(expr.eyeTilt);
        if (expr.mouthWidth != null) setV2MouthWidth(expr.mouthWidth);
        if (expr.mouthOpen != null)  setV2MouthOpen(expr.mouthOpen);
        if (expr.mouthSmile != null) setV2MouthSmile(expr.mouthSmile);
        if (expr.mouthY != null)     setV2MouthY(expr.mouthY);
      }

      const vis = data.visualState;
      if (vis) {
        if (vis.v2Color != null) setV2Color(vis.v2Color);
        if (vis.v2Size != null) setV2Size(vis.v2Size);
        if (vis.v2Wind != null) setV2Wind(vis.v2Wind);
        if (vis.v2RiseSpeed != null) setV2RiseSpeed(vis.v2RiseSpeed);
        if (vis.v2Turbulence != null) setV2Turbulence(vis.v2Turbulence);
        if (vis.v2NoiseFreq != null) setV2NoiseFreq(vis.v2NoiseFreq);
        if (vis.v2SparkCount != null) setV2SparkCount(vis.v2SparkCount);
      }
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const clock = useClock();
  const { isMobile } = useWindowWidth();

  const PRESETS: Record<string, any> = {
    idle: {
      v2MouthWidth: 8, v2MouthOpen: 0, v2MouthSmile: 0, v2MouthY: 14,
      v2EyeSquint: 0, v2EyeTilt: 0, v2EyeSpacing: 16, v2EyeSize: 5,
      v2Turbulence: 25, v2RiseSpeed: 1, v2SparkCount: 12, v2Color: "#10c8a8"
    },
    smile: {
      v2MouthWidth: 10, v2MouthOpen: 0, v2MouthSmile: 6, v2MouthY: 14,
      v2EyeSquint: 0.3, v2EyeTilt: 10, v2EyeSpacing: 16, v2EyeSize: 5,
      v2Turbulence: 25, v2RiseSpeed: 1, v2SparkCount: 12, v2Color: "#10c8a8"
    },
    happy: {
      v2MouthWidth: 14.5, v2MouthOpen: 4.5, v2MouthSmile: 15, v2MouthY: 23,
      v2EyeSquint: 0, v2EyeTilt: -8, v2EyeSpacing: 22, v2EyeSize: 9,
      v2Turbulence: 30, v2RiseSpeed: 1.2, v2SparkCount: 20, v2Color: "#10c8a8"
    },
    angry: {
      v2MouthWidth: 4.5, v2MouthOpen: 0, v2MouthSmile: -4.5, v2MouthY: 10,
      v2EyeSquint: 0.6, v2EyeTilt: 44, v2EyeSpacing: 16, v2EyeSize: 7.5,
      v2Turbulence: 45, v2RiseSpeed: 2, v2SparkCount: 30, v2Color: "#ff0000"
    },
    dumb: {
      v2MouthWidth: 20, v2MouthOpen: 0, v2MouthSmile: 2, v2MouthY: 13,
      v2EyeSquint: 0, v2EyeTilt: 0, v2EyeSpacing: 26, v2EyeSize: 2,
      v2Turbulence: 20, v2RiseSpeed: 0.8, v2SparkCount: 5, v2Color: "#10c8a8"
    },
    sleepy: {
      v2MouthWidth: 6, v2MouthOpen: 0, v2MouthSmile: 0, v2MouthY: 14,
      v2EyeSquint: 0.8, v2EyeTilt: 0, v2EyeSpacing: 16, v2EyeSize: 5,
      v2Turbulence: 15, v2RiseSpeed: 0.5, v2SparkCount: 2, v2Color: "#aaccff"
    },
    thinking: {
      v2MouthWidth: 5, v2MouthOpen: 0, v2MouthSmile: -2.5, v2MouthY: 7,
      v2EyeSquint: 0.6, v2EyeTilt: -10, v2EyeSpacing: 12, v2EyeSize: 6.5,
      v2Turbulence: 25, v2RiseSpeed: 1, v2SparkCount: 10, v2Color: "#10c8a8"
    }
  };

  const applyPreset = (p: any) => {
    if (p.v2MouthWidth !== undefined) setV2MouthWidth(p.v2MouthWidth);
    if (p.v2MouthOpen !== undefined) setV2MouthOpen(p.v2MouthOpen);
    if (p.v2MouthSmile !== undefined) setV2MouthSmile(p.v2MouthSmile);
    if (p.v2MouthY !== undefined) setV2MouthY(p.v2MouthY);
    if (p.v2EyeSquint !== undefined) setV2EyeSquint(p.v2EyeSquint);
    if (p.v2EyeTilt !== undefined) setV2EyeTilt(p.v2EyeTilt);
    if (p.v2EyeSpacing !== undefined) setV2EyeSpacing(p.v2EyeSpacing);
    if (p.v2EyeSize !== undefined) setV2EyeSize(p.v2EyeSize);
    if (p.v2Turbulence !== undefined) setV2Turbulence(p.v2Turbulence);
    if (p.v2RiseSpeed !== undefined) setV2RiseSpeed(p.v2RiseSpeed);
    if (p.v2SparkCount !== undefined) setV2SparkCount(p.v2SparkCount);
    if (p.v2Color !== undefined) setV2Color(p.v2Color);
  };

  const generalSliders = [
    { label: responsive ? "Overall Size (Auto)" : "Overall Size", value: size, set: setSize, min: 80, max: 320, step: 10, disabled: responsive },
    { label: "Speech Font Size",   value: speechFontSize,   set: setSpeechFontSize,  min: 10,  max: 32,  step: 1    },
    { label: "Speech Auto Delay",  value: speechDisappearDelay, set: setSpeechDisappearDelay, min: 1000, max: 10000, step: 500 },
  ];

  const v2Sliders = [
    { label: "V2 Rise Speed",    value: v2RiseSpeed,   set: setV2RiseSpeed,   min: 0,    max: 3,    step: 0.1 },
    { label: "V2 Size",          value: v2Size,        set: setV2Size,        min: 0.5,  max: 3,    step: 0.1 },
    { label: "V2 Turbulence",    value: v2Turbulence,  set: setV2Turbulence,  min: 0,    max: 50,   step: 1 },
    { label: "V2 Noise Freq",    value: v2NoiseFreq,   set: setV2NoiseFreq,   min: 0.001,max: 0.05, step: 0.001 },
    { label: "V2 Spark Count",   value: v2SparkCount,  set: setV2SparkCount,  min: 0,    max: 40,   step: 1 },
    { label: "V2 Wind",          value: v2Wind,        set: setV2Wind,        min: -2,   max: 2,    step: 0.1 },
    { label: "V2 Eye Spacing",   value: v2EyeSpacing,  set: setV2EyeSpacing,  min: 5,    max: 30,   step: 1 },
    { label: "V2 Eye Size",      value: v2EyeSize,     set: setV2EyeSize,     min: 2,    max: 15,   step: 0.5 },
    { label: "V2 Eye Squint",    value: v2EyeSquint,   set: setV2EyeSquint,   min: 0,    max: 1,    step: 0.1 },
    { label: "V2 Eye Tilt",      value: v2EyeTilt,     set: setV2EyeTilt,     min: -45,  max: 45,   step: 1 },
    { label: "V2 Mouth Width",   value: v2MouthWidth,  set: setV2MouthWidth,  min: 2,    max: 20,   step: 0.5 },
    { label: "V2 Mouth Open",    value: v2MouthOpen,   set: setV2MouthOpen,   min: 0,    max: 15,   step: 0.5 },
    { label: "V2 Mouth Smile",   value: v2MouthSmile,  set: setV2MouthSmile,  min: -10,  max: 15,   step: 0.5 },
    { label: "V2 Mouth Y",       value: v2MouthY,      set: setV2MouthY,      min: 0,    max: 30,   step: 1 },
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

        {/* Entity Viewer(s) */}
        <div style={panelStyle}>
          <PanelCorners />
          <PanelHeader>Entity Viewer</PanelHeader>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: spacing.lg }}>
            <div style={{
              width: responsive ? "100%" : undefined,
              height: responsive ? "400px" : undefined,
              maxWidth: responsive ? "100%" : undefined,
              border: responsive ? `1px dashed ${colors.border}` : "1px solid transparent",
              padding: responsive ? spacing.md : undefined,
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              resize: responsive ? "both" : "none",
              overflow: responsive ? "hidden" : "visible",
              transition: "border 0.28s, height 0.28s",
            }}>
              <BanaspatiV2
                  v2Color={v2Color}
                  v2Wind={v2Wind}
                  v2RiseSpeed={v2RiseSpeed}
                  v2Size={v2Size}
                  v2Turbulence={v2Turbulence}
                  v2NoiseFreq={v2NoiseFreq}
                  v2SparkCount={v2SparkCount}
                  v2ShowFace={v2ShowFace}
                  v2FaceColor={v2FaceColor}
                  v2EyeSpacing={v2EyeSpacing}
                  v2EyeSize={v2EyeSize}
                  v2EyeSquint={v2EyeSquint}
                  v2EyeTilt={v2EyeTilt}
                  v2MouthWidth={v2MouthWidth}
                  v2MouthOpen={v2MouthOpen}
                  v2MouthSmile={v2MouthSmile}
                  v2MouthY={v2MouthY}
                  speech={speech || undefined}
                  speechKey={speechKey}
                  speechFontSize={speechFontSize}
                  speechDisappearDelay={speechDisappearDelay}
                  followCursor={followCursor}
                  lookAt={followCursor ? undefined : lookAt}
                  size={size}
                  responsive={responsive}
                  onClick={() => setClickCount((c) => c + 1)}
                />
              </div>

          </div>{/* end entity row */}
          <div style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${spacing.sm}px ${spacing.lg}px`, fontSize: fontSizes.xs }}>
            {[
              ["STATUS",       "ACTIVE"],
              ["INTERACTIONS", clickCount.toString().padStart(4, "0")],
              ["OPACITY",      "1.0"],
              ["SCALE",        "1.0"],
              ["GLOW SPREAD",  "1.0"],
              ["RESPONSIVE",   responsive ? "ON" : "OFF"],
              ["OVERALL SIZE", responsive ? "AUTO (RESPONSIVE)" : `${size}px`],
              ["SPEECH SIZE",  `${speechFontSize}px`],
              ["SPEECH DELAY", `${speechDisappearDelay}ms`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: colors.dim, letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ color: colors.hi, fontWeight: 400 }}>{val}</span>
              </div>
            ))}
          </div>
          {/* Speech input */}
          <div style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTop: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs, marginBottom: spacing.sm }}>
              <div style={{ display: "flex", gap: spacing.sm }}>
                <textarea
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                  placeholder="Type something multi-line… (Ctrl+Enter to Say)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      if (speechInput.trim()) {
                        setSpeech(speechInput.trim());
                        setSpeechKey((k) => k + 1);
                      }
                    }
                  }}
                  rows={3}
                  style={{
                    flex: 1,
                    background: "rgba(120,160,200,0.02)",
                    border: `1px solid ${colors.border}`,
                    color: colors.hi,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: fontSizes.xs,
                    padding: spacing.sm,
                    resize: "vertical",
                    minHeight: 60,
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderHi;
                    e.currentTarget.style.boxShadow = "0 0 8px rgba(120,160,200,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => {
                    if (speechInput.trim()) {
                      setSpeech(speechInput.trim());
                      setSpeechKey((k) => k + 1);
                    }
                  }}
                  style={{
                    width: 70,
                    background: "rgba(120,160,200,0.08)",
                    color: colors.hi,
                    border: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    fontSize: fontSizes.xs,
                    letterSpacing: "0.08em",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.18)"; e.currentTarget.style.borderColor = colors.borderHi; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.08)"; e.currentTarget.style.borderColor = colors.border; }}
                >
                  SAY
                </button>
              </div>
            </div>
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
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(PRESETS[name as keyof typeof PRESETS])}
                  style={{ padding: `${spacing.sm}px ${spacing.lg}px`, background: "rgba(120,160,200,0.06)", color: colors.hi, border: `1px solid ${colors.border}`, cursor: "pointer", fontWeight: 400, textTransform: "uppercase", fontFamily: "inherit", fontSize: fontSizes.xs, letterSpacing: "0.1em", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.14)"; e.currentTarget.style.borderColor = colors.borderHi; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(120,160,200,0.06)"; e.currentTarget.style.borderColor = colors.border; }}
                >{name}</button>
              ))}
            </div>
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

          {/* Layout Mode */}
          <div style={{ marginBottom: spacing.xl }}>
            <label style={sectionLabelStyle}>▸ Layout Mode</label>
            <HudToggle
              value={responsive}
              onChange={setResponsive}
              label="RESPONSIVE"
              offLabel="FIXED SIZE"
              style={{ marginBottom: spacing.md }}
            />
            {responsive && (
              <p style={{ fontSize: fontSizes.xs, color: colors.dim, margin: `${spacing.xs}px 0 0`, lineHeight: 1.45 }}>
                💡 Container is resizable. Click and drag the bottom-right corner of the dashed boundary in the Entity Viewer.
              </p>
            )}
          </div>
          {/* Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
            <label style={sectionLabelStyle}>▸ Controls</label>
            {[...generalSliders, ...v2Sliders].map((s) => {
              const disabled = s.disabled;
              let valueText = disabled ? "AUTO" : s.value.toFixed(2);
              if (!disabled) {
                if (s.label.includes("Delay")) {
                  valueText = `${s.value}ms`;
                } else if (s.label.includes("Size")) {
                  valueText = `${s.value.toFixed(0)}px`;
                }
              }
              const pct = disabled ? 50 : ((s.value - s.min) / (s.max - s.min)) * 100;
              return (
                <div key={s.label} style={{ opacity: disabled ? 0.45 : 1, transition: "opacity 0.22s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
                    <span style={{ color: colors.dim, fontSize: fontSizes.xs, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                    <span style={{ color: colors.hi, fontSize: fontSizes.xs, fontWeight: 400, fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "right" }}>{valueText}</span>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "rgba(120,160,200,0.06)", border: `1px solid ${colors.border}` }}>
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: disabled ? "rgba(120,160,200,0.2)" : colors.mid, transition: "width 0.15s" }} />
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                      disabled={disabled}
                      onChange={(e) => s.set(parseFloat(e.target.value))}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: disabled ? "not-allowed" : "pointer", margin: 0 }} />
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
