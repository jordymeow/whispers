# Repository Guidelines

## Project Structure & Module Organization
Midnight Whisper is a Next.js App Router project. UI screens live in `app/` with route groups: `app/midnight-whisper` (reader), `app/admin` (dashboard), `app/login` (auth) and `app/setup` (onboarding). API handlers reside in `app/api/...`, sharing the Mongoose models from `models/`. Shared server/client utilities live in `lib/` (authentication, MongoDB connection, whisper presets). Reusable UI components belong in `components/`, currently `components/whispers/WhisperCard.tsx`. Static assets and fonts stay in `public/`, and cross-route guards are defined in `middleware.ts`.

## Build, Test, and Development Commands
Prefer pnpm for dependency management. Run `pnpm install` after pulling new changes. Use `pnpm dev` to start the Turbopack development server on http://localhost:3000, and make sure required env vars are present before launching. `pnpm build` produces an optimized bundle, while `pnpm start` serves that bundle in production mode. When debugging database issues, stop the server, update `.env.local`, then relaunch with `pnpm dev` to reload connections.

## Coding Style & Naming Conventions
TypeScript is the default; keep files as `.tsx` for React screens and `.ts` for utilities and models. Follow the existing two-space indentation, single quotes, and explicit semicolons. Components should be PascalCase (`WhisperCard`), hooks and helpers camelCase, and constants SCREAMING_CASE. Keep React components functional, colocate feature styling by extending Tailwind utility classes in `app/globals.css`, and reuse helpers from `lib/whispers.ts` instead of duplicating icon logic.

## Testing Guidelines
Automated tests are not wired up yet, so validate flows manually in `pnpm dev`, focusing on login, admin CRUD, and public feed rendering. When you introduce automated coverage, prefer Vitest or Playwright and store specs alongside features as `__tests__/*.test.ts`. Exercise new API routes with both success and failure cases, seed Mongo fixtures via temporary helpers, and document any required test data in the pull request.

## Commit & Pull Request Guidelines
History currently contains only the scaffold commit; adopt Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) to describe intent in 72 characters or fewer. Each PR should group related changes, include a summary of risk areas, list manual or automated test results, and link tracking issues when available. Screenshots or clips are expected when altering UI states (home feed, admin dashboard). Request review before merging and wait for green builds once a CI pipeline is added.

## Security & Configuration Tips
Secrets belong in `.env.local`; at minimum set `MONGODB_URI` and `NEXTAUTH_SECRET` with unique values. Never commit the file. Rotate credentials whenever sharing access, and confirm the JWT secret matches the environment where tokens originate. For local runs, use throwaway Mongo databases and clean them after testing sensitive content.
