# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-25

### Added
- Initial release of Banaspati component
- Physics-based bounce and squash animations
- Perlin-noise flame rendering with customizable parameters
- Mouse-tracked eye movement with smooth interpolation
- Six mood expressions: idle, happy, surprised, sleepy, excited, suspicious
- Fully customizable props for flame appearance and behavior
- TypeScript support with comprehensive type definitions
- Zero external dependencies (React only)
- Interactive demo and playground
- Comprehensive documentation

### Features
- `mood` prop for controlling eye expressions
- `sphereOpacity` and `sphereScale` for appearance customization
- `flameAmplitude`, `flameIntensity`, `flameDrift` for flame control
- `flameNoiseScale`, `flameUpwardBias`, `flameSpread` for advanced flame shaping
- `onClick` callback for interaction handling
- Automatic blinking animation
- RequestAnimationFrame-based rendering for smooth 60fps animations
- Ref-based state management to prevent React re-renders
