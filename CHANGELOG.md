# Changelog

All notable changes to this project follow [Semantic Versioning](https://semver.org/).

## [0.0.1] - 2026-06-03

### ✨ Features

- ProgressBar class with full lifecycle control
- Factory function `createProgressBar()` for quick setup
- Relative (`+/-`) and absolute progress updates
- Throttled rendering for smooth terminal output
- Real-time ETA calculation with human-readable formatting
- Pause/resume support for async workflows
- State inspection via `getProgress()`
- Customizable UI: symbols, prefix, suffix, bar width
- Quiet mode for CI/CD environments
- Full TypeScript support with JSDoc

### 📖 Documentation

- README with quick start and API reference
- CONTRIBUTING guidelines
- Comprehensive JSDoc on all public APIs

### 🧪 Tests

- 45 Vitest unit tests (96% coverage)
- Fake timer mocking for reliable throttling tests
- Coverage thresholds: lines ≥90%, branches ≥75%

### 🔧 Tooling

- TypeScript strict configuration
- ESLint + Prettier setup
- Husky pre-commit hooks
- Vitest + coverage reporting
- VSCode settings and extensions
