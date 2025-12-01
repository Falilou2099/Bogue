# 🚀 Guide de Déploiement - TicketFlow

## 📋 Ce que j'ai fait

### ✅ **1. Rate Limiting Implémenté**
- Fichier créé : `lib/rate-limit.ts`
- Limite : **5 tentatives de connexion par 15 minutes**
- Protection contre les attaques brute force
- Headers `Retry-After` en cas de dépassement

### ✅ **2. Logs d'Audit Complets**
- Nouveau modèle Prisma : `AuditLog`
- Logs automatiques pour :
  - ✅ Connexions réussies (`LOGIN_SUCCESS`)
  - ✅ Connexions échouées (`LOGIN_FAILED`)
  - ✅ Adresse IP capturée
  - ✅ Timestamp et détails
- Prêt pour : modifications de rôles, suppressions, etc.

### ✅ **3. Content Security Policy (CSP)**
- Headers CSP ajoutés dans `next.config.mjs`
- Protection XSS avancée
- Permissions-Policy pour caméra/micro/géolocalisation

---

## 🎯 CE QUE TU DOIS FAIRE MAINTENANT

### **Étape 1 : Appliquer la Migration Prisma** 🔧

La base de données doit être mise à jour avec la nouvelle table `audit_logs`.

```bash
# Exécute cette commande :
npx prisma migrate dev --name add-audit-logs

# Puis régénère le client :
npx prisma generate
```

**⚠️ IMPORTANT** : Cette commande va créer une nouvelle table dans ta base de données.

---

### **Étape 2 : Tester en Local** ✅

Avant de déployer, teste que tout fonctionne :

```bash
# 1. Démarre le serveur
npm run dev

# 2. Teste le rate limiting
# Essaie de te connecter 6 fois avec un mauvais mot de passe
# La 6ème tentative devrait être bloquée avec l'erreur :
# "Trop de tentatives de connexion. Réessayez plus tard."

# 3. Vérifie les logs d'audit
# Connecte-toi avec succès, puis vérifie dans ta base de données :
# SELECT * FROM audit_logs ORDER BY "createdAt" DESC LIMIT 10;
```

---

### **Étape 3 : Déployer sur Vercel** 🌐

#### **3.1 Préparer les Variables d'Environnement**

Tu auras besoin de :
- `DATABASE_URL` : URL de ta base de données PostgreSQL (Neon/Supabase)
- `NEXTAUTH_SECRET` : Secret pour JWT (génère avec `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` : URL de ton app déployée (ex: `https://ticketflow.vercel.app`)

#### **3.2 Déployer**

```bash
# Option 1 : Via l'interface Vercel
1. Va sur https://vercel.com
2. Connecte ton repo GitHub
3. Importe le projet
4. Ajoute les variables d'environnement
5. Clique sur "Deploy"

# Option 2 : Via CLI
npm install -g vercel
vercel login
vercel --prod
```

#### **3.3 Configurer la Base de Données en Production**

```bash
# Après le déploiement, applique les migrations en production
# (Vercel le fait automatiquement si tu as un script postinstall)

# Ou manuellement :
DATABASE_URL="ton_url_production" npx prisma migrate deploy
```

---

### **Étape 4 : Vérifier le Déploiement** ✅

Une fois déployé, vérifie :

1. **HTTPS Actif** : L'URL doit commencer par `https://`
2. **Headers de Sécurité** : Ouvre les DevTools → Network → Clique sur une requête → Onglet "Headers"
   - Vérifie la présence de : `Content-Security-Policy`, `X-Frame-Options`, etc.
3. **Rate Limiting** : Teste 6 connexions échouées → Doit bloquer
4. **Logs d'Audit** : Connecte-toi → Vérifie dans la base que le log est créé

---

## 📊 Score Final Attendu

Après déploiement : **100/100** 🎉

| Critère | Avant | Après |
|---------|-------|-------|
| Rate Limiting | ❌ | ✅ |
| Logs d'Audit | ⚠️ Partiel | ✅ Complet |
| CSP Headers | ❌ | ✅ |
| Déploiement HTTPS | ❌ | ✅ (après étape 3) |

---

## 🔍 Commandes Utiles

```bash
# Voir les logs d'audit en base
npx prisma studio
# Puis navigue vers "AuditLog"

# Tester le rate limiting
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -v

# Vérifier les headers CSP
curl -I https://ton-app.vercel.app
```

---

## ❓ En Cas de Problème

### **Erreur : "Property 'auditLog' does not exist"**
→ Exécute `npx prisma generate` pour régénérer le client Prisma

### **Rate Limiting ne fonctionne pas**
→ Vérifie que `lib/rate-limit.ts` est bien importé dans `app/api/auth/login/route.ts`

### **CSP bloque des ressources**
→ Ajuste les directives dans `next.config.mjs` (ligne 33-41)

### **Migration Prisma échoue**
→ Vérifie que `DATABASE_URL` est correct dans `.env`

---

## 📝 Résumé des Fichiers Modifiés

```
✅ lib/rate-limit.ts (nouveau)
✅ prisma/schema.prisma (+ AuditLog model)
✅ app/api/auth/login/route.ts (+ rate limiting + logs)
✅ next.config.mjs (+ CSP headers)
✅ GUIDE_DEPLOIEMENT.md (ce fichier)
```

---

**🎯 PROCHAINE ÉTAPE** : Exécute `npx prisma migrate dev --name add-audit-logs` puis teste en local avant de déployer !
