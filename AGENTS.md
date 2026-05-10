# Repository Guidelines

## Project Structure & Module Organization

This is a Bun workspace with two apps under `apps/`. `apps/web/` contains the Next.js 16 web app: routes and API handlers live in `src/app/`, reusable components in `src/components/`, shared utilities and auth/Prisma integrations in `src/lib/`, database schema and migrations in `prisma/`, and static assets in `public/`. `apps/mobile/` contains the Expo app: routes are in `src/app/`, shared UI in `src/components/`, hooks in `src/hooks/`, theme constants in `src/constants/`, and images/icons in `assets/`.

## Build, Test, and Development Commands

Use Bun from the relevant package directory unless noted.

- `bun install` at the repo root installs workspace dependencies from `bun.lock`.
- `cd apps/web && bun run dev` starts the Next.js dev server.
- `cd apps/web && bun run build` builds the web app and validates routes/types.
- `cd apps/web && bun run lint` runs ESLint for the web app.
- `cd apps/web && bunx prisma migrate dev` applies local Prisma migrations.
- `cd apps/mobile && bun run start` starts Expo.
- `cd apps/mobile && bun run android`, `ios`, or `web` starts the matching Expo target.
- `cd apps/mobile && bun run lint` runs Expo linting.

## Coding Style & Naming Conventions

Write TypeScript with 2-space indentation. Use PascalCase for React components, camelCase for variables/functions, and kebab-case for route folders and component filenames such as `resource-card.tsx`. Keep domain logic in `src/lib/` or feature components rather than embedding it in pages. Prefer existing UI primitives in `apps/web/src/components/ui/` and existing mobile themed components before adding new patterns.

## Testing Guidelines

No dedicated automated test suite is currently committed. Treat lint and build commands as the minimum verification gate for changed apps. For database changes, run Prisma migrations locally against PostgreSQL and manually verify affected flows. When adding tests, colocate them near the feature or use a `src/__tests__/` directory with `*.test.ts` or `*.test.tsx` naming.

## Commit & Pull Request Guidelines

This workspace does not include Git history, so use concise Conventional Commit-style subjects: `feat: add resource filters`, `fix: handle missing session`, `chore: update deps`. Pull requests should include a summary, verification commands run, linked issue when relevant, screenshots for UI changes, and notes for schema, migration, or environment changes.

## Security & Configuration Tips

Do not commit `.env` files or secrets. For the web app, start from `apps/web/exemple.env` and set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Review files under `public/uploads/` before committing generated or user-provided assets.
