# Repository Guidelines

## Project Structure & Module Organization
Midnight Whisper is a Next.js App Router project. Page code lives in `app/` with route groups `app/midnight-whisper`, `app/admin`, `app/login`, and `app/setup`. API handlers stay under `app/api/...` and share Mongoose models from `models/`. Reusable utilities belong in `lib/`, and UI pieces go in `components/` (e.g. `components/whispers/WhisperCard.tsx`). Static assets and fonts live in `public/`, while cross-route guards sit in `middleware.ts`.

## Build, Test, and Development Commands
Run `pnpm install` after pulling to sync dependencies. Use `pnpm dev` to launch Turbopack on http://localhost:3000; ensure `.env.local` provides `MONGODB_URI` and `NEXTAUTH_SECRET`. Build production bundles with `pnpm build` and serve them via `pnpm start`. When debugging database issues, restart `pnpm dev` after editing environment variables.

## Coding Style & Naming Conventions
Write TypeScript or TSX with two-space indentation, single quotes, and explicit semicolons. Keep React components functional and use PascalCase (`WhisperCard`) for components, camelCase for helpers, and SCREAMING_CASE for constants. Extend styles with Tailwind classes in `app/globals.css`. Reuse helper logic from `lib/whispers.ts` instead of reimplementing icons or presets.

## Testing Guidelines
Automated tests are not yet wired up; validate flows manually in `pnpm dev`, focusing on login, admin CRUD, and the public feed. If you add automated coverage, prefer Vitest or Playwright, name files `__tests__/feature.test.ts`, and document required fixtures.

## Commit & Pull Request Guidelines
Follow Conventional Commits such as `feat: add admin filters`, keeping subjects under 72 characters. PRs should group related changes, describe risk areas, list manual or automated test results, and attach screenshots or clips for UI updates. Request review before merging and wait for green CI once available.

## Security & Configuration Tips
Never commit `.env.local`; store secrets like `MONGODB_URI` and `NEXTAUTH_SECRET` there and rotate them when sharing access. Use disposable Mongo databases for local runs and clean sensitive data after testing. Keep JWT secrets aligned across environments to avoid auth issues.
