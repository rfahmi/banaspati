# 🔥 Banaspati

<div align="center">

**A self-contained animated avatar component package for React featuring physics-based interactions, Perlin-noise flame rendering, and highly customizable geometric expressions.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/demo-live-blue)](https://rfahmi.github.io/banaspati)

[**Live Demo**](https://rfahmi.github.io/banaspati) • [Installation](#-installation) • [BanaspatiV2 (New)](#-banaspati-v2-recommended) • [Banaspati V1 (Legacy)](#-banaspati-v1-legacy) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🌌 BanaspatiV2 (Next-Gen Avatar)
- 🎛️ **Granular Geometric Controls** — Direct control over face parameters like eye size, squint, tilt, mouth smile, opening, width, and Y-position.
- 🧪 **Fluid Double-Canvas Engine** — Renders the organic goo-filtered flames on one canvas, and high-performance additive glow layers + geometric eyes/mouth on another to prevent browser composite lag.
- 🌪️ **Perlin Noise & SVG Filters** — Uses real-time SVG filters with fractal noise for organic displacement and fluid flame motion.
- ☄️ **Dynamic Particle Sparks** — Custom generator emitting trailing spark particles with customized physics.
- 🎯 **Advanced Gaze & Drag Physics** — Features dragging physics with realistic acceleration/friction bounds, and customizable mouse/manual gaze tracking.
- 💬 **HUD-Style Typewriter Speech Bubble** — Renders animated monospace text cleanly below the character without interfering with the rendering pipeline.

### 🔥 Banaspati V1 (Original Avatar)
- 🎨 **Perlin-noise flame rendering** — Organic, ever-changing flame effect rendered on canvas.
- ⚡ **Physics-based bounce & squash** — Click to trigger satisfying bounce animations.
- 👀 **Mouse-tracked eye movement** — Eyes follow your cursor with smooth interpolation.
- 😊 **Eight mood expressions** — Predefined string moods: `idle`, `happy`, `surprised`, `sleepy`, `excited`, `suspicious`, `angry`, `sad`.

---

## 📦 Installation

```bash
npm install @rfahmi/banaspati
```

---

## 🚀 Banaspati V2 (Recommended)

Banaspati V2 moves away from simple mood string props in favor of granular geometric variables, enabling you to build and animate completely custom facial expressions dynamically.

### Basic Usage

```tsx
import { BanaspatiV2 } from "@rfahmi/banaspati";

function App() {
  return (
    <div style={{ width: "300px", height: "300px" }}>
      <BanaspatiV2 />
    </div>
  );
}
```

### With Custom Geometric Expression

```tsx
import { BanaspatiV2 } from "@rfahmi/banaspati";

function App() {
  return (
    <BanaspatiV2
      v2Color="#ff4500" // Red-orange flame color
      v2EyeSize={7.5}
      v2EyeSquint={0.6}
      v2EyeTilt={44}
      v2EyeSpacing={16}
      v2MouthWidth={4.5}
      v2MouthOpen={0}
      v2MouthSmile={-4.5}
      v2MouthY={10}
      v2Turbulence={45}
      v2RiseSpeed={2.0}
      v2SparkCount={30}
    />
  );
}
```

---

## 🚀 Banaspati V1 (Legacy)

The original version of Banaspati uses a predefined `mood` prop and runs inside a single-canvas layout.

### Basic Usage

```tsx
import Banaspati from "@rfahmi/banaspati";

function App() {
  return <Banaspati mood="happy" />;
}
```

---

## 📚 API Reference

### `BanaspatiV2Props` (V2 Component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **Flame Visuals & Physics** | | | |
| `v2Color` | `string` | `"#10c8a8"` | Hex/CSS color code for the flame. |
| `v2Wind` | `number` | `0` | Lateral wind push force (-2 to 2). |
| `v2RiseSpeed` | `number` | `1` | Vertical flame rising velocity multiplier. |
| `v2Size` | `number` | `1.2` | Vertical flame height scale factor. |
| `v2Turbulence` | `number` | `25` | SVG filter displacement intensity for flame waviness. |
| `v2NoiseFreq` | `number` | `0.015` | Noise base frequency for fractal displacement mapping. |
| `v2SparkCount` | `number` | `12` | Max number of active particle sparks emitted. |
| **Geometric Facial Expression** | | | |
| `v2ShowFace` | `boolean` | `true` | Show or hide the face (eyes + mouth). |
| `v2FaceColor` | `string` | `"#ffffff"` | Color of eyes and mouth. |
| `v2EyeSpacing` | `number` | `16` | Distance between left and right eye centers. |
| `v2EyeSize` | `number` | `5` | Radius of the eyes. |
| `v2EyeSquint` | `number` | `0` | Vertical eye compression ratio (0 = round, 1 = slit/line). |
| `v2EyeTilt` | `number` | `0` | Inner/outer tilt angle in degrees (positive = angry/focus, negative = sad/worried). |
| `v2MouthWidth` | `number` | `8` | Width of the mouth. |
| `v2MouthOpen` | `number` | `0` | Vertical opening height of the mouth. |
| `v2MouthSmile` | `number` | `6` | Curvature of the mouth (positive = smile, negative = frown). |
| `v2MouthY` | `number` | `14` | Vertical position offset from the face center. |
| **Gaze & Sizing** | | | |
| `followCursor` | `boolean` | `true` | Whether the gaze tracks the mouse position. |
| `lookAt` | `{ x: number; y: number }` | `undefined` | Gaze direction when `followCursor={false}` (-1 to 1). |
| `size` | `number` | `160` | Fixed size in pixels when `responsive` is `false`. |
| `responsive` | `boolean` | `false` | Dynamically stretch and scale to fit parent container. |
| **Typewriter Speech Overlay** | | | |
| `speech` | `string` | `undefined` | Multi-line speech text to render in typewriter block. |
| `speechKey` | `string \| number` | `undefined` | Key value changed to re-trigger typewriter transition. |
| `speechFontSize` | `number` | `16` | Font size for speech overlay text. |
| `speechDisappearDelay`| `number` | `3000` | Delay in ms before speech disappears after typing completes. |
| **Interactions** | | | |
| `onClick` | `() => void` | `undefined` | Triggered when character is clicked/pointer-down. |

---

### `BanaspatiProps` (V1 Component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mood` | `AvatarMood` | `"idle"` | Predefined expression: `"idle"`, `"happy"`, `"surprised"`, `"sleepy"`, `"excited"`, `"suspicious"`, `"angry"`, `"sad"`. |
| `sphereOpacity` | `number` | `1` | Opacity of the sphere body. |
| `sphereScale` | `number` | `1` | Scale multiplier for sphere. |
| `flameAmplitude` | `number` | `40` | Max spike height of flame. |
| `flameIntensity` | `number` | `1.0` | Brightness of the flame layer. |
| `flameDrift` | `number` | `1.0` | Speed of flame movement. |
| `flameNoiseScale` | `number` | `1.5` | Noise scale multiplier. |
| `flameUpwardBias` | `number` | `0.85` | Horizontal/vertical drift ratio. |
| `flameSpread` | `number` | `2.2` | Flame taper spread width. |
| `flameGlowSpread` | `number` | `1.0` | Size of outer gradient glow. |
| `followCursor` | `boolean` | `true` | Gaze tracks mouse. |
| `lookAt` | `{ x: number; y: number }` | `undefined` | Manual look direction. |
| `onClick` | `() => void` | `undefined` | Bounce interaction callback. |
| `onPointerDown` | `(e) => void` | `undefined` | Pointer down event (useful for drag anchors). |
| `speech` | `string` | `undefined` | Typewriter speech message. |
| `size` | `number` | `160` | Fixed size in pixels. |
| `responsive` | `boolean` | `false` | Responsive container fitting. |

---

## 🎭 Preset Expressions (V2 Reference)

Below are the exact values mapping to the default presets in the control dashboard, allowing you to replicate or customize them easily:

### 1. Idle (Neutral State)
```json
{
  "v2EyeSpacing": 16,
  "v2EyeSize": 5,
  "v2EyeSquint": 0,
  "v2EyeTilt": 0,
  "v2MouthWidth": 8,
  "v2MouthOpen": 0,
  "v2MouthSmile": 0,
  "v2MouthY": 14
}
```

### 2. Smile
```json
{
  "v2EyeSpacing": 16,
  "v2EyeSize": 5,
  "v2EyeSquint": 0.3,
  "v2EyeTilt": 10,
  "v2MouthWidth": 10,
  "v2MouthOpen": 0,
  "v2MouthSmile": 6,
  "v2MouthY": 14
}
```

### 3. Happy
```json
{
  "v2EyeSpacing": 22,
  "v2EyeSize": 9,
  "v2EyeSquint": 0,
  "v2EyeTilt": -8,
  "v2MouthWidth": 14.5,
  "v2MouthOpen": 4.5,
  "v2MouthSmile": 15,
  "v2MouthY": 23
}
```

### 4. Angry
```json
{
  "v2EyeSpacing": 16,
  "v2EyeSize": 7.5,
  "v2EyeSquint": 0.6,
  "v2EyeTilt": 44,
  "v2MouthWidth": 4.5,
  "v2MouthOpen": 0,
  "v2MouthSmile": -4.5,
  "v2MouthY": 10
}
```

### 5. Dumb
```json
{
  "v2EyeSpacing": 26,
  "v2EyeSize": 2,
  "v2EyeSquint": 0,
  "v2EyeTilt": 0,
  "v2MouthWidth": 20,
  "v2MouthOpen": 0,
  "v2MouthSmile": 2,
  "v2MouthY": 13
}
```

### 6. Sleepy
```json
{
  "v2EyeSpacing": 16,
  "v2EyeSize": 5,
  "v2EyeSquint": 0.8,
  "v2EyeTilt": 0,
  "v2MouthWidth": 6,
  "v2MouthOpen": 0,
  "v2MouthSmile": 0,
  "v2MouthY": 14
}
```

### 7. Thinking
```json
{
  "v2EyeSpacing": 12,
  "v2EyeSize": 6.5,
  "v2EyeSquint": 0.6,
  "v2EyeTilt": -10,
  "v2MouthWidth": 5,
  "v2MouthOpen": 0,
  "v2MouthSmile": -2.5,
  "v2MouthY": 7
}
```

---

## 🛠️ Technical Details & Performance

- **Dual-Canvas Splitting:** V2 uses two canvases to eliminate rendering composite pipeline bottlenecking. Canvas 1 uses SVG goo/displacement filters to render the flame texture, and Canvas 2 handles the high-density additive glow layers and vector character face.
- **Physics Engine:** Inertial drag and release velocities are simulated on each frame using spring equations, matching drag points with exact scale offsets.
- **Ref-Cached Updates:** To keep updates at a locked 60fps, prop changes are updated using React refs directly inside the requestAnimationFrame render loops, preventing expensive React component re-renders.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © [Nur Fahmi](https://github.com/rfahmi)
