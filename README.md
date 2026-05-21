Salut
# RRB — Ressources Relationnelles (Dev)

Description
-----------
Projet monorepo contenant deux applications React/Expo pour la gestion et la consultation de ressources relationnelles :

- `apps/web` : application Next.js (web).
- `apps/mobile` : application Expo (mobile).

Structure du dépôt
------------------

- `apps/web/` : Next.js 16, routes dans `src/app/`, composants réutilisables dans `src/components/`, utilitaires dans `src/lib/`, schéma Prisma dans `prisma/`.
- `apps/mobile/` : Expo app, code React Native dans `src/`, assets dans `assets/`.
- `prisma/` : schéma et migrations (dans `apps/web/prisma/`).

Prérequis
---------

- Node.js (compatible Bun) et Bun installé si vous utilisez les scripts Bun.
- PostgreSQL pour le développement local si vous utilisez Prisma migrations.

Commandes courantes
-------------------

- Installer les dépendances (racine du repo) :

```
bun install
```

- Démarrer l'application Web en développement :

```
cd apps/web && bun run dev
```

- Construire l'application Web :

```
cd apps/web && bun run build
```

- Lancer lint (web) :

```
cd apps/web && bun run lint
```

- Appliquer les migrations Prisma (web) :

```
cd apps/web && bunx prisma migrate dev
```

- Démarrer l'application mobile (Expo) :

```
cd apps/mobile && bun run start
```

Conventions de développement
---------------------------

- TypeScript avec indentation 2 espaces.
- PascalCase pour les composants React, camelCase pour les fonctions et variables.
- Mettre la logique métier dans `src/lib/` plutôt que dans les pages.

Variables d'environnement
------------------------

Ne pas committer les fichiers `.env`. Pour le web, commencez à partir de `apps/web/exemple.env` et définissez au minimum :

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Contribution
------------

- Utilisez des messages de commit concis et de type Conventional Commits (ex: `feat: ...`, `fix: ...`).
- Lors d'une PR, ajoutez un résumé, commandes de vérification et captures d'écran si nécessaire.