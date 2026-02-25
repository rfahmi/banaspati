# 🚀 Quick Start Guide

Welcome to Banaspati! This guide will help you get started with development and publishing.

## 📋 Repository Structure

```
banaspati/
├── src/
│   ├── Banaspati.tsx      # Main component
│   └── index.ts           # Public exports
├── example/
│   ├── Demo.tsx           # Interactive demo
│   └── index.html         # Demo HTML entry
├── dist/                  # Build output (generated)
├── .gitignore
├── .npmignore
├── .prettierrc
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── PUBLISHING.md
├── README.md
├── package.json
└── tsconfig.json
```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development

```bash
npm run dev
```

This watches for file changes and rebuilds automatically.

### 3. Build for Production

```bash
npm run build
```

Generates optimized build in `dist/` folder.

## 🎨 Running the Demo

To see the component in action, you can set up a local dev server:

### Option 1: Using Vite (Recommended)

Install Vite in the example folder:

```bash
cd example
npm init -y
npm install vite @vitejs/plugin-react --save-dev
```

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

Add to package.json:

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

Then run:

```bash
npm run dev
```

### Option 2: Using any other dev server

Point your dev server to the `example/` directory.

## 📦 Building the Package

Before publishing:

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Verify build output
ls -la dist/
```

You should see:
- `index.js` (CommonJS)
- `index.mjs` (ES Module)
- `index.d.ts` (TypeScript definitions)

## 🚀 Publishing to npm

See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions.

Quick version:

```bash
# 1. Login to npm
npm login

# 2. Build the package
npm run build

# 3. Publish
npm publish --access public
```

## 🧪 Testing Locally

Before publishing, test the package in another project:

```bash
# In banaspati directory
npm link

# In your test project
npm link com.rfahmi.banaspati
```

Then import and use:

```tsx
import Banaspati from 'com.rfahmi.banaspati';

function App() {
  return <Banaspati mood="happy" />;
}
```

## 📚 Documentation

- **README.md** - Main documentation and API reference
- **CONTRIBUTING.md** - How to contribute to the project
- **CHANGELOG.md** - Version history and changes
- **PUBLISHING.md** - How to publish to npm

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

MIT © Nur Fahmi - See [LICENSE](./LICENSE) for details.

---

**Need help?** Open an issue on GitHub!
