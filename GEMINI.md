# GEMINI.md

## Project Overview

This is a full-stack web application built with [Next.js](https://nextjs.org/) (version 16) and TypeScript. The application features a complete authentication system, a PostgreSQL database managed with [Prisma](https://www.prisma.io/), and a modern frontend stack.

### Key Technologies:

- **Framework:** Next.js 16 (with React 19)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** `better-auth` library with email/password support and an admin interface.
- **Styling:** Tailwind CSS with `clsx` and `tailwind-merge`.
- **UI Components:** A mix of custom components (in `src/components/ui`) and primitives from Radix UI.
- **Linting:** ESLint

## Building and Running

### 1. Prerequisites

- Node.js
- A running PostgreSQL database instance.

### 2. Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    Create a `.env` file by copying the `exemple.env` file. Fill in the required environment variables, especially the `DATABASE_URL`.
    ```bash
    cp exemple.env .env
    ```
3.  **Database Migration:**
    Apply the database schema to your PostgreSQL database using Prisma Migrate.
    ```bash
    npx prisma migrate dev
    ```

### 3. Running the Application

- **Development:** To run the development server with hot-reloading:

  ```bash
  npm run dev
  ```

  The application will be available at `http://localhost:3000`.

- **Production Build:** To create a production-ready build:

  ```bash
  npm run build
  ```

- **Start Production Server:** To run the production build:
  ```bash
  npm run start
  ```

### 4. Other Scripts

- **Linting:** To check the code for any linting errors:
  ```bash
  npm run lint
  ```

## Development Conventions

### Architecture

- The application follows the standard Next.js App Router structure.
- API routes are located in `src/app/api/`.
- Authentication logic is centralized in `src/lib/auth.ts`.
- The database schema is defined in `prisma/schema.prisma`.
- Reusable UI components are in `src/components/ui/`.

### Authentication

- Authentication is managed by the `better-auth` library.
- The configuration in `src/lib/auth.ts` shows that email and password authentication is enabled.
- It also uses the `prismaAdapter` to connect to the database.
- An admin plugin is enabled, which likely provides an admin interface for user management.

### Database

- Prisma is the designated ORM. To interact with the database or make schema changes, use the `prisma` CLI (e.g., `npx prisma studio`, `npx prisma migrate dev`).
- The database schema includes models for `User`, `Session`, `Account`, and `Verification`. The `User` model has fields for roles and banning, suggesting a robust user management system.
