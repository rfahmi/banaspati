# 🔥 Banaspati

<div align="center">

**A self-contained animated teal blob avatar with physics-based interactions and Perlin-noise flame rendering.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/demo-live-blue)](https://rfahmi.github.io/banaspati)

[**Live Demo**](https://rfahmi.github.io/banaspati) • [Installation](#installation) • [Usage](#usage) • [API](#api) • [Examples](#examples)

</div>

---

## ✨ Features

- 🎨 **Perlin-noise flame rendering** — Organic, ever-changing flame effect rendered on canvas
- ⚡ **Physics-based bounce & squash** — Click to trigger satisfying bounce animations
- 👀 **Mouse-tracked eye movement** — Eyes follow your cursor with smooth interpolation
- 😊 **Eight mood expressions** — `idle`, `happy`, `surprised`, `sleepy`, `excited`, `suspicious`, `angry`, `sad`
- 🎛️ **Highly customizable** — Control flame intensity, amplitude, drift, and more
- 🪶 **Zero dependencies** — Only requires React (no external animation libraries)
- 📦 **TypeScript support** — Fully typed with comprehensive interfaces
- 🚀 **Performance optimized** — Uses requestAnimationFrame for smooth 60fps animations

---

## 📦 Installation

```bash
npm install @rfahmi/banaspati
```

or using yarn:

```bash
yarn add @rfahmi/banaspati
```

or using pnpm:

```bash
pnpm add @rfahmi/banaspati
```

or directly from GitHub:

```bash
npm install github:rfahmi/banaspati
```

---

## 🚀 Usage

### Basic Usage

```tsx
import Banaspati from "@rfahmi/banaspati";

function App() {
  return (
    <div>
      <Banaspati />
    </div>
  );
}
```

### With Customization

```tsx
import Banaspati from "@rfahmi/banaspati";

function App() {
  return (
    <div>
      <Banaspati
        mood="happy"
        flameAmplitude={60}
        flameIntensity={1.5}
        sphereScale={1.2}
        sphereOpacity={0.9}
        onClick={() => console.log("Banaspati clicked!")}
      />
    </div>
  );
}
```

### Interactive Example

```tsx
import { useState } from "react";
import Banaspati, { type AvatarMood } from "@rfahmi/banaspati";

function InteractiveAvatar() {
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [intensity, setIntensity] = useState(1.0);

  return (
    <div>
      <Banaspati
        mood={mood}
        flameIntensity={intensity}
        onClick={() => setMood("excited")}
      />

      <div style={{ marginTop: "20px" }}>
        <label>
          Mood:
          <select value={mood} onChange={(e) => setMood(e.target.value as AvatarMood)}>
            <option value="idle">Idle</option>
            <option value="happy">Happy</option>
            <option value="surprised">Surprised</option>
            <option value="sleepy">Sleepy</option>
            <option value="excited">Excited</option>
            <option value="suspicious">Suspicious</option>
            <option value="angry">Angry</option>
            <option value="sad">Sad</option>
          </select>
        </label>

        <label style={{ marginLeft: "20px" }}>
          Flame Intensity:
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
```

---

## 📚 API

### `BanaspatiProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mood` | `AvatarMood` | `"idle"` | Controls the eye expression: `"idle"`, `"happy"`, `"surprised"`, `"sleepy"`, `"excited"`, `"suspicious"`, `"angry"`, `"sad"` |
| `sphereOpacity` | `number` | `1` | Opacity of the sphere body (0–1). Eyes remain fully visible. |
| `sphereScale` | `number` | `1` | Scale multiplier for the entire avatar. `1` = default size, `2` = double size. |
| `flameAmplitude` | `number` | `40` | Maximum spike height of flame tips in pixels (0–80). |
| `flameIntensity` | `number` | `1.0` | Overall brightness multiplier (0–2). `0` = invisible, `2` = very bright. |
| `flameDrift` | `number` | `1.0` | Speed of upward flame animation (0–3). `0` = frozen, `3` = fast-moving. |
| `flameNoiseScale` | `number` | `1.5` | Frequency of Perlin noise (0.3–3). Low = smooth waves, high = turbulent detail. |
| `flameUpwardBias` | `number` | `0.85` | How much side flames redirect upward (0–1.5). `0` = pure outward, `1.5` = strongly upward. |
| `flameSpread` | `number` | `2.2` | Flame taper sharpness (0.5–4). Low = wide flame, high = narrow pointed tip. |
| `onClick` | `() => void` | `undefined` | Callback fired when the avatar is clicked. |

### `AvatarMood`

```tsx
type AvatarMood = "idle" | "happy" | "surprised" | "sleepy" | "excited" | "suspicious" | "angry" | "sad";
```

---

## 🎨 Examples

### Ghost Mode (Transparent Sphere)

```tsx
<Banaspati
  sphereOpacity={0.3}
  flameIntensity={1.8}
/>
```

### Minimal Flame

```tsx
<Banaspati
  flameAmplitude={20}
  flameIntensity={0.5}
  flameDrift={0.5}
/>
```

### Dramatic Effect

```tsx
<Banaspati
  mood="excited"
  flameAmplitude={70}
  flameIntensity={2}
  flameDrift={2.5}
  sphereScale={1.5}
/>
```

### Calm & Sleepy

```tsx
<Banaspati
  mood="sleepy"
  flameAmplitude={25}
  flameIntensity={0.6}
  flameDrift={0.3}
/>
```

### Rage Mode

```tsx
<Banaspati
  mood="angry"
  flameAmplitude={80}
  flameIntensity={2.0}
  flameDrift={3.0}
  flameNoiseScale={2.5}
  flameUpwardBias={1.4}
  flameSpread={1.2}
  sphereScale={1.2}
/>
```

### Sad & Subdued

```tsx
<Banaspati
  mood="sad"
  flameAmplitude={20}
  flameIntensity={0.6}
  flameDrift={0.4}
  flameSpread={3.0}
/>
```

---

## 🎭 Mood Gallery

| Mood | Description | Visual Effect |
|------|-------------|---------------|
| `idle` | Neutral, round eyes | Default state — calm and attentive |
| `happy` | Bottom-clipped eyes | Smile-shaped eyes like a cheerful friend |
| `surprised` | Wide open, larger radius | Alert and startled expression |
| `sleepy` | Top-clipped eyes | Half-closed, drowsy look |
| `excited` | Slightly bottom-clipped, smaller | Energetic and enthusiastic vibe |
| `suspicious` | Asymmetric top-clip | Side-eye, skeptical expression |
| `angry` | Tilted V-brow, narrowed | Furrowed, intense glare |
| `sad` | Inverted V-brow, drooping outer corners | Puppy-eyes, sorrowful look |

---

## 🛠️ Technical Details

### Architecture

- **Animation Loop**: Uses `requestAnimationFrame` for 60fps rendering
- **Physics Simulation**: Spring-based squash & bounce with gravity
- **Flame Rendering**: Multi-layered Perlin noise (FBM) with radial gradients
- **Eye Tracking**: Smooth linear interpolation toward mouse position with 3D sphere-surface foreshortening
- **State Management**: Ref-based to avoid React re-renders during animation

### Performance

- **No re-renders**: All animations run in RAF loops, not React state
- **Canvas optimization**: DPI-aware rendering with proper scaling
- **Memory efficient**: Single Perlin noise instance with typed arrays
- **Passive listeners**: Mouse events use `{ passive: true }`

### Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

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

---

## 🙏 Acknowledgments

- Inspired by organic flame effects and playful UI interactions
- Perlin noise algorithm based on Ken Perlin's original work
- Built with ❤️ for the React community

---

## 📬 Contact

- GitHub: [@rfahmi](https://github.com/rfahmi)
- Issues: [Report a bug](https://github.com/rfahmi/banaspati/issues)

---

<div align="center">

**[⬆ Back to Top](#-banaspati)**

Made with 🔥 by Nur Fahmi

</div>
