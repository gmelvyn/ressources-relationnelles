# Installation du projet (RE)Sources Relationnelles

Ce guide décrit les prérequis et les commandes à exécuter pour installer et lancer l'application pour la première fois.

## Prérequis

Installez les éléments suivants sur votre machine :

- **Bun** : runtime et gestionnaire de paquets utilisé par le projet.
- **Node.js** : requis par certains outils de l'écosystème Next.js.
- **PostgreSQL** : base de données de l'application.
- **Git** : pour récupérer le projet si nécessaire.

Vérifiez les installations :

```bash
bun --version
node --version
psql --version
git --version
```

## 1. Installer les dépendances

Depuis la racine du projet :

```bash
bun install
```

## 2. Configurer les variables d'environnement

Créez un fichier `.env` à partir de l'exemple :

```bash
Copy-Item exemple.env .env
```

Avec un shell Unix :

```bash
cp exemple.env .env
```

Renseignez les variables suivantes dans `.env` :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rrb"
BETTER_AUTH_SECRET="un-secret-long-et-aleatoire"
BETTER_AUTH_URL="http://localhost:3000"
```

Générez un secret Better Auth :

```bash
bun --eval "console.log(Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))"
```

Copiez la valeur générée dans `BETTER_AUTH_SECRET`.

## 3. Préparer PostgreSQL

Créez une base PostgreSQL nommée `rrb` si elle n'existe pas déjà :

```bash
createdb rrb
```

Si `createdb` n'est pas disponible, utilisez `psql` :

```bash
psql -U postgres
```

Puis dans le prompt PostgreSQL :

```sql
CREATE DATABASE rrb;
\q
```

Assurez-vous que `DATABASE_URL` correspond bien à votre utilisateur, mot de passe, hôte, port et nom de base.

## 4. Générer le client Prisma

```bash
bunx prisma generate
```

## 5. Appliquer les migrations

```bash
bunx prisma migrate dev
```

Cette commande crée les tables nécessaires pour l'authentification, les utilisateurs, les ressources, le catalogue, la progression, les commentaires, la modération et l'administration.

## 6. Insérer les données de départ

```bash
bun run seed
```

Le seed ajoute les catégories, types de relations, types de ressources et plusieurs ressources de démonstration issues du sujet.

## 7. Lancer l'application en développement

```bash
bun run dev
```

L'application est disponible sur :

```txt
http://localhost:3000
```

## 8. Créer un premier compte

Ouvrez :

```txt
http://localhost:3000/signup
```

Créez un compte citoyen avec une adresse email et un mot de passe.

## 9. Donner les droits super-administrateur au premier compte

Après création du premier compte, connectez-vous à PostgreSQL :

```bash
psql -U postgres -d rrb
```

Puis remplacez l'email par celui du compte créé :

```sql
UPDATE "user"
SET role = 'super_admin'
WHERE email = 'votre-email@example.com';
```

Quittez PostgreSQL :

```sql
\q
```

Le back-office sera ensuite accessible ici :

```txt
http://localhost:3000/admin
```

## Commandes utiles

```bash
bun run dev
bun run build
bun run start
bun run lint
bunx prisma generate
bunx prisma migrate dev
bun run seed
```

## Vérification avant livraison

Exécutez au minimum :

```bash
bun run lint
bun run build
```

`bun run lint` peut afficher des avertissements sur d'anciens composants utilisant `<img>`, mais ne doit pas retourner d'erreur.

## Dépannage

Si Prisma ne trouve pas la base :

- vérifiez que PostgreSQL est démarré ;
- vérifiez `DATABASE_URL` dans `.env` ;
- vérifiez que la base `rrb` existe.

Si le port `3000` est déjà utilisé :

```bash
bun run dev -- -p 3001
```

L'application sera alors disponible sur :

```txt
http://localhost:3001
```

Si les pages n'affichent pas les ressources de démonstration :

```bash
bun run seed
```
