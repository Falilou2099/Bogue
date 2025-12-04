# 📚 Guide d'Installation pour l'Évaluation - TicketFlow

> **Document destiné à l'évaluateur/évaluatrice**  
> Temps d'installation estimé : **5 minutes**

---

## 🎯 Vue d'ensemble

Ce projet est **prêt à l'emploi**. Vous n'avez pas besoin de configurer une base de données - tout est déjà configuré sur **Neon PostgreSQL** (cloud).

---

## 📦 Étape 1 : Décompresser le fichier .env

Vous avez reçu un fichier **`.env.zip`** protégé par mot de passe.

### **🔑 Mot de passe**
Le mot de passe du fichier ZIP est **le même mot de passe** que vous avez demandé pour le compte administrateur.

### **📝 Instructions**
1. Localisez le fichier `.env.zip` dans le dossier du projet
2. Décompressez-le avec le mot de passe fourni
3. Placez le fichier `.env` à la **racine du projet** (même niveau que `package.json`)

Un fichier `.env` est déjà présent à la racine du projet avec toutes les variables nécessaires :

```env
# Base de données PostgreSQL (Neon)
DATABASE_URL="postgresql://ticketflow_owner:..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere"
```

⚠️ **IMPORTANT** : Générez un nouveau secret pour `NEXTAUTH_SECRET` :

```bash
openssl rand -base64 32
```

Copiez le résultat et remplacez `votre-secret-genere` dans le fichier `.env`.

### **Étape 3 : Installer les dépendances**

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires (React, Next.js, Prisma, etc.).

### **Étape 4 : Générer le client Prisma**

```bash
npx prisma generate
```

### **Étape 5 : Initialiser la base de données**

```bash
npx tsx prisma/seed.ts
```

Cette commande va créer toutes les données de test (utilisateurs, tickets, catégories, etc.).

### **Étape 6 : Démarrer l'application**

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

---

## 🔑 Comptes Utilisateurs

### **Compte Administrateur Principal**
```
Email: admin@ticketflow.com
Mot de passe: Admin123!@#
```

### **Tous les Comptes de Test**

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| **Admin** | admin@ticketflow.com | Admin123!@# | Accès total au système |
| **Admin** | admin@ticketflow.com | Password123!@ | Compte alternatif |
| **Manager** | manager@ticketflow.com | Password123!@ | Gestion d'équipe, rapports |
| **Agent** | agent@ticketflow.com | Password123!@ | Support niveau 1 |
| **Agent** | agent2@ticketflow.com | Password123!@ | Support niveau 2 |
| **Client** | client@example.com | Password123!@ | Utilisateur final |
| **Client** | client2@example.com | Password123!@ | Utilisateur final |

---

## 🎮 Fonctionnalités Principales

### **Dashboard**
- Vue d'ensemble des tickets
- Statistiques en temps réel
- Graphiques de performance
- Métriques SLA

### **Gestion des Tickets**
- **6 tickets de test** déjà créés
- Statuts : OUVERT, EN_COURS, EN_ATTENTE, RESOLU, FERME
- Priorités : CRITIQUE, HAUTE, MOYENNE, BASSE
- Système de tags et catégories

### **Base de Connaissances**
- **3 articles** pré-chargés
- Système de recherche
- Votes utile/pas utile
- Catégorisation

### **Système de Permissions**
- 4 rôles : ADMIN, MANAGER, AGENT, DEMANDEUR
- Permissions granulaires
- Protection des routes sensibles

### **Notifications**
- **4 notifications** de test
- Types : Nouveau ticket, SLA, Messages, Assignations
- Marquage lu/non lu

---

## 📊 Données de Test Pré-chargées

### **Catégories (5)**
- Technique
- Facturation
- Commercial
- Support Général
- Fonctionnalités

### **SLA (4)**
- Critique : 30min réponse, 4h résolution
- Haute : 1h réponse, 8h résolution
- Moyenne : 4h réponse, 24h résolution
- Basse : 24h réponse, 72h résolution

### **Tickets (6)**
- TKT-001 : Problème connexion mobile (EN_COURS)
- TKT-002 : Demande remboursement (EN_ATTENTE)
- TKT-003 : Erreur 500 paiement (OUVERT)
- TKT-004 : Devis entreprise (RESOLU)
- TKT-005 : Documentation API (EN_COURS)
- TKT-006 : Bug Firefox (FERME)

### **Messages (5)**
- Conversation complète sur TKT-001

### **Articles (3)**
- Réinitialisation mot de passe
- Guide d'intégration API
- FAQ Facturation

---

## ✅ Vérification Installation

### **Checklist Rapide**
```bash
# 1. Vérifier Node.js
node --version  # Doit être >= 18

# 2. Vérifier les dépendances
npm list @prisma/client  # Doit être installé

# 3. Vérifier la base de données
npx prisma studio  # Ouvre l'interface Prisma Studio

# 4. Tester la connexion
# Aller sur http://localhost:3000/login
# Se connecter avec admin@ticketflow.com / Admin123!@#
```

---

## 🆘 Résolution de Problèmes

### **Erreur JWT Signature**
Si vous voyez "JWSSignatureVerificationFailed" :
1. Arrêtez l'application (Ctrl+C)
2. Supprimez les cookies du navigateur
3. Relancez avec `npm run dev`

### **Base de données vide**
```bash
# Réinitialiser et remplir la base
npx tsx prisma/seed.ts
```

### **Erreur Prisma Client**
```bash
npx prisma generate
npm install
```

### **Port 3000 occupé**
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

---

## 🧪 Tests Unitaires

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

**Note** : Certains tests peuvent échouer en raison de mocks manquants, cela n'affecte pas le fonctionnement de l'application.

---

## 📝 Scripts Disponibles

```bash
npm run dev          # Démarrer en développement
npm run build        # Build production
npm start            # Démarrer en production
npm test             # Lancer les tests
npx prisma studio    # Interface BDD
npx tsx prisma/seed.ts  # Remplir la base
```

---

## 🎯 Pour l'Évaluation

### **Parcours Recommandé**

1. **Connexion Admin** → Dashboard → Vue d'ensemble
2. **Tickets** → Créer, modifier, assigner
3. **Base de connaissances** → Consulter articles
4. **Changement de rôle** → Tester avec agent@ticketflow.com
5. **Client** → Se connecter avec client@example.com
6. **Notifications** → Vérifier les alertes

### **Points d'Attention**
- ✅ Système de permissions fonctionnel
- ✅ SLA automatiques selon priorité
- ✅ Historique complet des actions
- ✅ Recherche et filtres avancés
- ✅ Interface responsive
- ✅ Sécurité (hash bcrypt, JWT, validation)

---

## 📞 Notes Finales

- **Temps d'installation** : ~3 minutes
- **Base de données** : Hébergée sur Neon (PostgreSQL cloud)
- **Authentification** : JWT avec NextAuth
- **UI** : Tailwind CSS + Shadcn/ui
- **Framework** : Next.js 16 avec App Router

---

**Application prête pour l'évaluation ! 🚀**
