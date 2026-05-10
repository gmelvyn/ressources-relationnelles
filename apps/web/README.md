# RRB

Application web construite avec **Next.js 16**, **React 19**, **TypeScript**, **Prisma**, **PostgreSQL** et **Better Auth**.  
Le projet utilise **Bun** comme runtime et gestionnaire de paquets.

## Stack technique

- **Next.js 16** avec App Router
- **React 19**
- **TypeScript**
- **Prisma** pour l'acces base de donnees
- **PostgreSQL** comme base de donnees
- **Better Auth** pour l'authentification
- **Tailwind CSS 4**
- **Radix UI** pour les composants accessibles

## Prerequis

- **Bun** installe sur la machine
- **PostgreSQL** accessible via une URL de connexion

## Installation

Installe les dependances avec Bun :

```bash
bun install
```

## Variables d'environnement

Le projet attend un fichier `.env` a la racine.  
Tu peux partir du fichier d'exemple :

```bash
Copy-Item exemple.env .env
```

Si tu utilises un shell Unix :

```bash
cp exemple.env .env
```

Contenu attendu :

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

### Explication des variables

- `DATABASE_URL` : URL de connexion PostgreSQL utilisee par Prisma
- `BETTER_AUTH_SECRET` : secret utilise par Better Auth pour signer et securiser les sessions/tokens
- `BETTER_AUTH_URL` : URL publique de l'application, par exemple `http://localhost:3000` en local

### Exemple de `.env` en local

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rrb"
BETTER_AUTH_SECRET="remplace-par-un-secret-long-et-aleatoire"
BETTER_AUTH_URL="http://localhost:3000"
```

## Generer `BETTER_AUTH_SECRET`

Le secret doit etre long, aleatoire et difficile a deviner.

Avec **Bun**, tu peux en generer un facilement :

```bash
bun --eval "console.log(Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))"
```

Cette commande genere un secret hexadecimal de 64 caracteres.  
Copie la valeur dans `BETTER_AUTH_SECRET`.

Exemple :

```env
BETTER_AUTH_SECRET="d9f0c2f1..."
```

## Utilisation de Bun dans ce projet

Le projet est prevu pour etre lance avec **Bun** :

- `bun install` : installe les dependances
- `bun run dev` : lance le serveur de developpement
- `bun run build` : cree le build de production
- `bun run start` : demarre l'application en mode production
- `bun run lint` : lance ESLint
- `bunx prisma migrate dev` : cree et applique une migration Prisma en local

`bunx` joue le meme role que `npx`, mais avec l'ecosysteme Bun.  
Ici, il permet d'executer Prisma sans installation globale.

## Lancer le projet en local

1. Installer les dependances :

```bash
bun install
```

2. Creer et remplir le fichier `.env`

3. Appliquer les migrations Prisma :

```bash
bunx prisma migrate dev
```

4. Lancer le serveur de developpement :

```bash
bun run dev
```

L'application sera disponible sur :

```txt
http://localhost:3000
```

## Scripts disponibles

```bash
bun run dev
bun run build
bun run start
bun run lint
```

## Structure du projet

```txt
src/
  app/          routes, layouts, pages, actions, API
  components/   composants UI et composants metier
  lib/          helpers partages, auth, Prisma
prisma/
  schema.prisma
  migrations/
public/
```

## Authentification

L'authentification repose sur **Better Auth** avec :

- connexion par email / mot de passe
- adaptateur Prisma
- stockage des donnees d'auth dans PostgreSQL
- route API exposee via `src/app/api/auth/[...all]/route.ts`

## Verification minimale apres modification

Avant de valider un changement, execute au minimum :

```bash
bun run lint
bun run build
```
