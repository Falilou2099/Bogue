# Configuration Neon Database pour Bogue

## 📋 Informations à récupérer depuis Neon

Pour connecter votre application à Neon PostgreSQL, vous devez récupérer deux chaînes de connexion depuis votre console Neon.

### Étape 1 : Créer un projet Neon

1. Allez sur [https://console.neon.tech](https://console.neon.tech)
2. Connectez-vous ou créez un compte
3. Cliquez sur **"Create a project"**
4. Donnez un nom à votre projet (ex: `bogue-ticketing`)
5. Sélectionnez une région proche de vous (ex: `AWS eu-west-1` pour l'Europe)
6. Cliquez sur **"Create project"**

### Étape 2 : Récupérer les chaînes de connexion

Une fois votre projet créé :

1. Dans le dashboard Neon, cliquez sur **"Connection Details"** ou **"Connect"**
2. Vous verrez deux types de connexions :

#### A. Connection Pooled (pour DATABASE_URL)
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true
```
- Cette connexion utilise PgBouncer pour le pooling
- **Copiez cette URL complète** et remplacez `DATABASE_URL` dans votre fichier `.env`

#### B. Connection Direct (pour DIRECT_URL)
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```
- Cette connexion est directe (sans pooling)
- **Copiez cette URL complète** et remplacez `DIRECT_URL` dans votre fichier `.env`

### Étape 3 : Configurer votre fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplacez les valeurs :

```env
# Remplacez par votre connection string POOLED
DATABASE_URL="postgresql://votre-user:votre-password@ep-xxx-xxx.eu-west-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Remplacez par votre connection string DIRECT
DIRECT_URL="postgresql://votre-user:votre-password@ep-xxx-xxx.eu-west-1.aws.neon.tech/neondb?sslmode=require"
```

### Étape 4 : Générer le client Prisma et créer les tables

Une fois les URLs configurées, exécutez les commandes suivantes :

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour visualiser vos données
npx prisma studio
```

## 🔐 Informations importantes

### Format des URLs Neon

**DATABASE_URL (Pooled)** :
- Utilisée pour les requêtes normales de l'application
- Inclut `pgbouncer=true` pour le connection pooling
- Optimisée pour les environnements serverless (Next.js)

**DIRECT_URL (Direct)** :
- Utilisée pour les migrations Prisma
- Connexion directe sans pooling
- Nécessaire pour certaines opérations Prisma

### Exemple complet d'URLs Neon

```env
# Exemple avec un vrai format Neon
DATABASE_URL="postgresql://neondb_owner:AbCdEf123456@ep-cool-rain-12345678.eu-west-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://neondb_owner:AbCdEf123456@ep-cool-rain-12345678.eu-west-1.aws.neon.tech/neondb?sslmode=require"
```

### Composants de l'URL

- `neondb_owner` : Nom d'utilisateur (généré automatiquement par Neon)
- `AbCdEf123456` : Mot de passe (généré automatiquement par Neon)
- `ep-cool-rain-12345678` : Endpoint unique de votre base de données
- `eu-west-1` : Région AWS
- `neondb` : Nom de la base de données (par défaut)

## ✅ Vérification de la connexion

Pour vérifier que votre connexion fonctionne :

```bash
# Tester la connexion à la base de données
npx prisma db push

# Si tout fonctionne, vous verrez :
# ✔ Generated Prisma Client
# ✔ Database synchronized with Prisma schema
```

## 🚀 Prochaines étapes

Après avoir configuré Neon :

1. ✅ Générer le client Prisma : `npx prisma generate`
2. ✅ Créer les tables : `npx prisma db push`
3. ✅ (Optionnel) Ajouter des données de test avec un seed
4. ✅ Démarrer l'application : `npm run dev`

## 📚 Ressources

- [Documentation Neon](https://neon.tech/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Prisma + Neon Guide](https://neon.tech/docs/guides/prisma)
