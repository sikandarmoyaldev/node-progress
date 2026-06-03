# @sikandarmoyaldev/progress

> A lightweight, terminal-friendly progress bar for Node.js CLI tools

[![npm version](https://img.shields.io/npm/v/@sikandarmoyaldev/progress.svg)](https://www.npmjs.com/package/@sikandarmoyaldev/progress)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/sikandarmoyaldev/node-progress/actions/workflows/ci.yml/badge.svg)](https://github.com/sikandarmoyaldev/node-progress/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen.svg)](https://github.com/sikandarmoyaldev/node-progress#readme)

## ✨ Features

- 🎨 Beautiful Unicode progress bars with customizable symbols
- ⚡ Throttled rendering for smooth, high-frequency updates
- 🔄 Relative (`+/-`) and absolute progress control
- 🕐 Real-time ETA calculation + human-readable time formatting
- 🤫 Quiet mode for CI/CD and logging environments
- ⏸️ Pause/resume support for complex async workflows
- 📊 State inspection for metrics and external integrations
- 🛡️ Fully typed with TypeScript + comprehensive JSDoc
- 🧩 Zero dependencies

## 📦 Installation

```bash
npm install @sikandarmoyaldev/progress
# or
pnpm add @sikandarmoyaldev/progress
# or
yarn add @sikandarmoyaldev/progress
```

## 🚀 Usage

### Quick Start

```ts
import { createProgressBar } from "@sikandarmoyaldev/progress";

const bar = createProgressBar(100);
for (let i = 0; i <= 100; i++) {
    bar.increment();
    await new Promise((r) => setTimeout(r, 50));
}
bar.complete("✅ All tasks finished!");
```

### Advanced Configuration

```ts
import { ProgressBar } from "@sikandarmoyaldev/progress";

const bar = new ProgressBar({
    total: 500,
    quiet: process.env.CI === "true",
    barWidth: 50,
    prefix: "⚡",
    symbol: { filled: "▓", empty: "▒" },
    updateInterval: 50,
});

bar.start({ initialValue: 25, message: "Resuming download..." });

// Relative updates (supports negative for retries)
bar.update(10, { relative: true }); // +10
bar.update(-5, { relative: true }); // -5

// Absolute updates
bar.update(350); // Jump to exact position

// Inspect state
const state = bar.getProgress();
console.log(`Progress: ${state.percent}% | ETA: ${state.etaMs}ms`);

bar.complete("🎉 Complete!");
```

## 📖 API Reference

### createProgressBar(total: number, quiet?: boolean): ProgressBar

Factory function for quick instantiation. Recommended for most use cases.

#### ProgressBar Methods

| Method                         | Description                                                        |
| :----------------------------- | :----------------------------------------------------------------- |
| `start(options?)`              | Initialize/restart progress. Supports `initialValue` and `message` |
| `increment(count?)`            | Advance progress by positive steps (default: 1)                    |
| `update(value, options?)`      | Set absolute position OR relative delta (`{ relative: true }`)     |
| `render()`                     | Force immediate re-render (bypasses throttling)                    |
| `complete(message?)`           | Mark as 100% complete + optional success message                   |
| `error(message)`               | Halt progress, clear line, and log error to stderr                 |
| `pause()` / `resume()`         | Temporarily hide visual updates                                    |
| `getProgress(): ProgressState` | Return current snapshot (`current`, `percent`, `etaMs`, etc.)      |
| `isComplete(): boolean`        | Check if progress has reached target                               |

#### ProgressOptions

| Option                                    | Type    | Default                       | Description                    |
| :---------------------------------------- | :------ | :---------------------------- | :----------------------------- |
| `total`                                   | number  | _required_                    | Target steps/items             |
| `quiet`                                   | boolean | `false`                       | Disable terminal output        |
| `barWidth`                                | number  | `40`                          | Visual bar width in characters |
| `symbol`                                  | object  | `{ filled: '█', empty: '░' }` | Custom bar characters          |
| `prefix` / `suffix`                       | string  | `🎬` / `""`                   | Text around the bar            |
| `showEta` / `showPercent` / `showCounter` | boolean | `true`                        | Toggle display sections        |
| `updateInterval`                          | number  | `100`                         | Min ms between renders         |

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Watch mode (TDD)
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Lint & format
pnpm lint && pnpm format

# Build package
pnpm build

# Type check
pnpm type-check
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
