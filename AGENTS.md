# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js 16 App Router application written in TypeScript. Main code lives under `src/`:

- `src/app/`: routes, layouts, server actions, and API handlers
- `src/components/`: feature components (`auth/`, `layout/`, `portal/`, `posts/`) plus shared `ui/` primitives
- `src/lib/`: shared utilities, Prisma client setup, and auth helpers
- `prisma/`: `schema.prisma` and migration history
- `public/`: static assets served as-is

Use the `@/*` path alias for imports from `src`.

## Build, Test, and Development Commands

- `bun install`: install dependencies; keep `bun.lock` in sync
- `bun run dev`: start the local Next.js dev server
- `bun run build`: create a production build
- `bun run start`: run the production build locally
- `bun run lint`: run ESLint with Next.js core-web-vitals and TypeScript rules
- `bunx prisma migrate dev`: create and apply a local migration when schema changes

## Coding Style & Naming Conventions

Follow strict TypeScript and the existing Next.js conventions. Use 2-space indentation, double quotes, and semicolons, matching the current files. Name React components in PascalCase, hooks and helpers in camelCase, and route folders with lowercase names. Keep reusable primitives in `src/components/ui/`; place feature-specific UI in the matching feature folder.

## Testing Guidelines

There is no dedicated automated test suite in the repository yet. Until one is added, contributors should treat `bun run lint` and a local `bun run build` as the minimum verification step for every change. If you add tests, colocate them with the feature or create a clear `tests/` directory, and use `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits such as `feat:`, `fix:`, `refactor:`, and `chore:`. Keep commit subjects short and imperative. For pull requests, include:

- a brief summary of the change
- linked issue or task reference when applicable
- screenshots or short recordings for UI changes
- notes about schema or environment changes

## Security & Configuration Tips

Do not commit secrets. Copy `exemple.env` for local setup and provide `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` before running auth or Prisma flows.
