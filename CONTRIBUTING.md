# Contributing to @sikandarmoyaldev/progress

Thank you for contributing! Follow these guidelines to maintain code quality.

## 🚀 Quick Start

1. Fork & clone: `git clone https://github.com/sikandarmoyaldev/node-progress.git`
2. Install: `pnpm install`
3. Branch: `git checkout -b feat/your-feature`
4. Code, test, and verify: `pnpm test && pnpm lint && pnpm build`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push & open PR

## 📝 Standards

- **Code**: TypeScript strict mode, no `any` without justification
- **Format**: Run `pnpm format` before committing
- **Tests**: Maintain ≥90% coverage, use `pnpm test:coverage`
- **Comments**: Tag critical logic with `!core:`, `!important:`, `!edge case:`

## 🧪 Testing

- Tests: `src/__tests__/*.test.ts`
- Mock `process.stdout` and `console.error` to avoid noise
- Use `vi.useFakeTimers()` for throttling/ETA tests
- Run `pnpm test` before every PR

## 🤝 Pull Requests

- **Title**: Follow Conventional Commits (`feat:`, `fix:`, `chore:`)
- **Description**: Explain what, why, and how to test
- **Checks**: CI must pass (lint, test, build)
- **Review**: Address feedback promptly

## ❓ Questions?

Open an [Issue](https://github.com/sikandarmoyaldev/node-progress/issues) or start a [Discussion](https://github.com/sikandarmoyaldev/node-progress/discussions).

Thank you! 🚀
