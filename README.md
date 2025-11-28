# TicketFlow - Système de Gestion de Tickets

## 🚀 Fonctionnalités

- ✅ **Authentification sécurisée** avec NextAuth et JWT
- ✅ **Gestion complète des tickets** (création, modification, assignation, suivi)
- ✅ **Base de connaissances** avec articles consultables
- ✅ **Dashboard avec statistiques** en temps réel
- ✅ **Gestion des équipes** et rôles (Admin, Manager, Agent, Demandeur)
- ✅ **Système de notifications** 
- ✅ **Historique des tickets** avec traçabilité complète
- ✅ **SLA automatiques** selon la priorité
- ✅ **Interface moderne** avec Tailwind CSS et shadcn/ui

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL (Neon recommandé)
- pnpm ou npm

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/ticketflow.git
cd ticketflow
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

Éditer `.env.local` avec vos valeurs :
- `DATABASE_URL` : URL de votre base PostgreSQL
- `NEXTAUTH_SECRET` : Clé secrète (générer avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` : URL de votre application

4. **Initialiser la base de données**
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 🏗️ Build et Déploiement

### Build de production
```bash
npm run build
```

### Démarrer en production
```bash
npm start
```

### Variables d'environnement de production

Copier `.env.production` et ajuster les valeurs :
```bash
cp .env.production .env.local
```

## 📝 Comptes de test

Après le seed de la base :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@ticketflow.com | Password123! | Admin |
| manager@ticketflow.com | Password123! | Manager |
| agent@ticketflow.com | Password123! | Agent |
| client@example.com | Password123! | Demandeur |

## 🔒 Sécurité

- Authentification JWT sécurisée
- Validation des données avec Zod
- Protection CSRF intégrée
- Sanitization des entrées
- Rate limiting recommandé en production

## 📊 Structure de la base de données

- **Users** : Utilisateurs avec rôles
- **Tickets** : Tickets de support
- **Categories** : Catégories de tickets
- **SLA** : Accords de niveau de service
- **TicketHistory** : Historique des modifications
- **TicketMessages** : Messages des tickets
- **Notifications** : Notifications système
- **Articles** : Articles de la base de connaissances

## 🚀 Déploiement recommandé

### Vercel
```bash
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📈 Monitoring

- Intégration Sentry possible via `SENTRY_DSN`
- Google Analytics via `NEXT_PUBLIC_GA_ID`
- Logs structurés en production

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT

## 🆘 Support

Pour toute question : support@ticketflow.com
