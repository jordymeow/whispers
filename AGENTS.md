# Repository Guidelines

## Project Structure & Module Organization
Midnight Whisper runs on Next.js App Router. Page code resides in `app/` with route groups such as `app/midnight-whisper`, `app/admin`, `app/login`, and `app/register`. API handlers live under `app/api/...` and reuse Mongoose models from `models/`. Place shared utilities in `lib/` and presentational pieces in `components/` (for example `components/whispers/WhisperCard.tsx`). Persist global styles and Tailwind layers in `app/globals.css`. Store static assets and fonts inside `public/`. Keep cross-route guards within `middleware.ts`. Create manual or automated tests under `__tests__/` when adding coverage.

## Build, Test, and Development Commands
Run `pnpm install` after pulling new branches to refresh dependencies. Use `pnpm dev` to launch Turbopack at http://localhost:3000; restart it after changing `.env.local`. Execute `pnpm build` to produce production bundles and `pnpm start` to serve them. Add targeted scripts under `package.json` rather than ad-hoc commands.

## Coding Style & Naming Conventions
Author all UI and server modules in TypeScript or TSX with two-space indentation, single quotes, and explicit semicolons. Keep React components functional and named with PascalCase, helpers with camelCase, and constants with SCREAMING_CASE. Extend styling via Tailwind classes or shared utilities instead of inline styles. Prefer reusing helpers from `lib/whispers.ts` and existing icons before introducing new variants.

## Testing Guidelines
Automated testing is not wired up yet; validate key flows manually while running `pnpm dev`, including public feed, login, and admin CRUD. If you add automated coverage, favour Vitest or Playwright, name files `__tests__/feature.test.ts`, and document required fixtures or data seeds in the PR.

## Commit & Pull Request Guidelines
Follow Conventional Commits (for example `feat: add admin filters`) and keep the subject under 72 characters. Scope each PR to a cohesive change set, and describe risk areas plus manual or automated test results. Include screenshots or short clips for UI updates. Request review before merging and wait for green CI when available.

## Security & Configuration Tips
Never commit `.env.local`; store secrets such as `MONGODB_URI` and `NEXTAUTH_SECRET` locally and rotate them when shared. Use disposable Mongo databases for development, clean out sensitive fixtures after testing, and keep JWT secrets aligned across environments to avoid authentication drift.
