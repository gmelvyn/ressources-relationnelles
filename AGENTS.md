# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 16 app using the App Router, React 19, TypeScript, Prisma, and Better Auth. Core application code lives in `src/`. Use `src/app/` for routes, layouts, server actions, and API handlers such as `src/app/api/auth/[...all]/route.ts`. Reusable UI belongs in `src/components/ui/`; feature components live beside their domain in folders like `src/components/auth/`, `src/components/layout/`, and `src/components/portal/`. Shared helpers and integrations live in `src/lib/`. Database schema and migrations are under `prisma/`. Static files and uploaded assets are served from `public/`.

## Build, Test, and Development Commands
Use Bun for local work:

- `bun install` installs dependencies from `bun.lock`.
- `bun run dev` starts the local dev server on `http://localhost:3000`.
- `bun run build` creates the production build and catches type and route issues.
- `bun run start` serves the production build locally.
- `bun run lint` runs ESLint with the Next.js and TypeScript rules.
- `bunx prisma migrate dev` creates and applies local schema migrations.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation style already used in the codebase and keep imports explicit. Prefer PascalCase for React components (`PortalHeader.tsx` pattern), camelCase for variables/functions, and kebab-case for route folders and UI filenames such as `post-card.tsx`. Keep shared utility logic in `src/lib/` and avoid placing Prisma or auth setup inside page files. Styling is handled with Tailwind CSS 4; reuse existing UI primitives before adding new custom markup.

## Testing Guidelines
There is no committed automated test suite yet. Until one is added, treat `bun run lint` and `bun run build` as the minimum verification gate for every change. For database work, run `bunx prisma migrate dev` against a local PostgreSQL instance and validate the affected flow manually. When adding tests later, place them near the feature or in a dedicated `src/__tests__/` tree and use `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history follows short Conventional Commit-style subjects such as `feat: add portal header and sidebar components` and `chore: update dependencies`. Keep commits focused and use prefixes like `feat:`, `fix:`, `chore:`, or `refactor:`. Pull requests should include a short summary, linked issue when relevant, notes about schema or env changes, and screenshots for UI updates.

## Security & Configuration Tips
Do not commit `.env`. Start from `exemple.env`, then set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Keep secrets local, and review generated files in `public/uploads/` before committing.
