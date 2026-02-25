import { useState } from "react";
import Banaspati, { type AvatarMood } from "../src";

/**
 * Interactive Demo for Banaspati Component
 * 
 * This example showcases all the customizable properties and interactions
 * available in the Banaspati avatar component.
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      color: "#ffffff",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "3rem", margin: "0 0 10px 0" }}>
            🔥 Banaspati
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#a0a0a0", margin: 0 }}>
            Interactive Demo & Playground
          </p>
        </header>

        {/* Main Content */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "start",
        }}>
          {/* Avatar Display */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
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
            <div style={{ textAlign: "center", color: "#a0a0a0" }}>
              <p style={{ margin: "10px 0" }}>Click the avatar to make it bounce!</p>
              <p style={{ margin: "10px 0", fontSize: "0.9rem" }}>
                Clicks: <strong style={{ color: "#00d9b3" }}>{clickCount}</strong>
              </p>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            padding: "30px",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Controls</h2>

            {/* Presets */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>
                Presets
              </label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {Object.keys(presets).map((presetName) => (
                  <button
                    key={presetName}
                    onClick={() => applyPreset(presetName as keyof typeof presets)}
                    style={{
                      padding: "8px 16px",
                      background: "#00d9b3",
                      color: "#1a1a2e",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {presetName}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Mood: <span style={{ color: "#00d9b3" }}>{mood}</span>
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as AvatarMood)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px solid #00d9b3",
                  background: "#1a1a2e",
                  color: "#ffffff",
                  fontSize: "1rem",
                }}
              >
                <option value="idle">Idle</option>
                <option value="happy">Happy</option>
                <option value="surprised">Surprised</option>
                <option value="sleepy">Sleepy</option>
                <option value="excited">Excited</option>
                <option value="suspicious">Suspicious</option>
              </select>
            </div>

            {/* Sliders */}
            {[
              { label: "Sphere Opacity", value: sphereOpacity, setValue: setSphereOpacity, min: 0, max: 1, step: 0.1 },
              { label: "Sphere Scale", value: sphereScale, setValue: setSphereScale, min: 0.5, max: 2, step: 0.1 },
              { label: "Flame Amplitude", value: flameAmplitude, setValue: setFlameAmplitude, min: 0, max: 80, step: 5 },
              { label: "Flame Intensity", value: flameIntensity, setValue: setFlameIntensity, min: 0, max: 2, step: 0.1 },
              { label: "Flame Drift", value: flameDrift, setValue: setFlameDrift, min: 0, max: 3, step: 0.1 },
              { label: "Flame Noise Scale", value: flameNoiseScale, setValue: setFlameNoiseScale, min: 0.3, max: 3, step: 0.1 },
              { label: "Flame Upward Bias", value: flameUpwardBias, setValue: setFlameUpwardBias, min: 0, max: 1.5, step: 0.05 },
              { label: "Flame Spread", value: flameSpread, setValue: setFlameSpread, min: 0.5, max: 4, step: 0.1 },
            ].map((slider) => (
              <div key={slider.label} style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {slider.label}: <span style={{ color: "#00d9b3" }}>{slider.value.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={slider.value}
                  onChange={(e) => slider.setValue(parseFloat(e.target.value))}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          marginTop: "60px",
          padding: "20px",
          color: "#a0a0a0",
          fontSize: "0.9rem",
        }}>
          <p>
            Built with ❤️ | <a href="https://github.com/rfahmi/banaspati" style={{ color: "#00d9b3" }}>GitHub</a>
            {" | "}
            <a href="https://www.npmjs.com/package/com.rfahmi.banaspati" style={{ color: "#00d9b3" }}>NPM</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
