# Guide de Test - Système de Permissions

## 🎯 Objectif

Ce guide vous permet de tester manuellement le système de permissions et de sécurité mis en place dans l'application TicketFlow.

---

## 📋 Prérequis

### **Créer des utilisateurs de test**

Vous devez avoir au minimum 4 utilisateurs avec des rôles différents :

```sql
-- CLIENT (Demandeur)
INSERT INTO users (id, email, name, password, role) VALUES 
('client-1', 'client@test.com', 'Client Test', '$2a$12$...', 'DEMANDEUR');

-- AGENT
INSERT INTO users (id, email, name, password, role) VALUES 
('agent-1', 'agent@test.com', 'Agent Test', '$2a$12$...', 'AGENT');

-- MANAGER
INSERT INTO users (id, email, name, password, role) VALUES 
('manager-1', 'manager@test.com', 'Manager Test', '$2a$12$...', 'MANAGER');

-- ADMIN
INSERT INTO users (id, email, name, password, role) VALUES 
('admin-1', 'admin@test.com', 'Admin Test', '$2a$12$...', 'ADMIN');
```

**Mot de passe de test** : `Test1234!` (à hasher avec bcrypt)

---

## ✅ Tests à Effectuer

### **1. Test de Redirection Automatique**

#### Test 1.1 : Page d'accueil
- [ ] Accéder à `http://localhost:3000/`
- [ ] **Résultat attendu** : Redirection automatique vers `/login`

#### Test 1.2 : Accès sans authentification
- [ ] Accéder à `http://localhost:3000/dashboard` sans être connecté
- [ ] **Résultat attendu** : Redirection vers `/login?redirect=/dashboard`

---

### **2. Tests CLIENT (Demandeur)**

#### Test 2.1 : Connexion
- [ ] Se connecter avec `client@test.com`
- [ ] **Résultat attendu** : Redirection vers `/dashboard`

#### Test 2.2 : Accès aux routes autorisées
- [ ] Accéder à `/dashboard` ✅
- [ ] Accéder à `/dashboard/tickets` ✅
- [ ] Accéder à `/knowledge-base` ✅

#### Test 2.3 : Accès aux routes interdites
- [ ] Tenter d'accéder à `/admin`
- [ ] **Résultat attendu** : Redirection vers `/dashboard`
- [ ] Tenter d'accéder à `/dashboard/users`
- [ ] **Résultat attendu** : Redirection vers `/dashboard`

#### Test 2.4 : API - Voir uniquement ses propres tickets
- [ ] Appeler `GET /api/tickets`
- [ ] **Résultat attendu** : Uniquement les tickets créés par ce client
- [ ] Vérifier que `tickets.every(t => t.createdById === 'client-1')`

#### Test 2.5 : API - Dashboard sans performances SLA
- [ ] Appeler `GET /api/dashboard/stats`
- [ ] **Résultat attendu** : Stats présentes MAIS `tauxSlaRespect` absent
```json
{
  "success": true,
  "stats": {
    "ticketsOuverts": 5,
    "ticketsEnCours": 3,
    "ticketsResolus": 10,
    "ticketsFermes": 2,
    "tempsResolutionMoyen": 24.5
    // ❌ PAS de "tauxSlaRespect"
  }
}
```

#### Test 2.6 : API - Interdictions
- [ ] Tenter `POST /api/categories` → **403 Forbidden**
- [ ] Tenter `POST /api/users` → **403 Forbidden**
- [ ] Tenter `DELETE /api/users/xxx` → **403 Forbidden**
- [ ] Tenter `POST /api/articles` → **403 Forbidden**

---

### **3. Tests AGENT**

#### Test 3.1 : Connexion
- [ ] Se connecter avec `agent@test.com`
- [ ] **Résultat attendu** : Redirection vers `/dashboard`

#### Test 3.2 : Accès aux routes
- [ ] Accéder à `/dashboard` ✅
- [ ] Accéder à `/dashboard/tickets` ✅
- [ ] Accéder à `/dashboard/analytics` ✅
- [ ] Accéder à `/knowledge-base` ✅
- [ ] Accéder à `/dashboard/categories` ✅
- [ ] Accéder à `/dashboard/sla` ✅
- [ ] Accéder à `/dashboard/users` ✅

#### Test 3.3 : API - Voir tous les tickets
- [ ] Appeler `GET /api/tickets`
- [ ] **Résultat attendu** : Tous les tickets (pas de filtrage)

#### Test 3.4 : API - Dashboard avec performances SLA
- [ ] Appeler `GET /api/dashboard/stats`
- [ ] **Résultat attendu** : Stats complètes avec `tauxSlaRespect`
```json
{
  "success": true,
  "stats": {
    "ticketsOuverts": 15,
    "ticketsEnCours": 8,
    "ticketsResolus": 45,
    "ticketsFermes": 12,
    "tempsResolutionMoyen": 18.3,
    "tauxSlaRespect": 92.5  // ✅ Présent pour Agent
  }
}
```

#### Test 3.5 : API - CRUD Tickets (autorisé)
- [ ] `POST /api/tickets` → **201 Created** ✅
- [ ] `PATCH /api/tickets/xxx` → **200 OK** ✅
- [ ] `DELETE /api/tickets/xxx` → **200 OK** ✅

#### Test 3.6 : API - Lecture seule (catégories, SLA, utilisateurs)
- [ ] `GET /api/categories` → **200 OK** ✅
- [ ] `GET /api/sla` → **200 OK** ✅
- [ ] `GET /api/users` → **200 OK** ✅

#### Test 3.7 : API - Interdictions (création/modification)
- [ ] `POST /api/categories` → **403 Forbidden** ❌
- [ ] `PATCH /api/categories/xxx` → **403 Forbidden** ❌
- [ ] `DELETE /api/categories/xxx` → **403 Forbidden** ❌
- [ ] `POST /api/sla` → **403 Forbidden** ❌
- [ ] `POST /api/users` → **403 Forbidden** ❌
- [ ] `DELETE /api/users/xxx` → **403 Forbidden** ❌
- [ ] `POST /api/articles` → **403 Forbidden** ❌

---

### **4. Tests MANAGER**

#### Test 4.1 : Connexion
- [ ] Se connecter avec `manager@test.com`
- [ ] **Résultat attendu** : Redirection vers `/dashboard`

#### Test 4.2 : Accès complet
- [ ] Accéder à toutes les routes ✅
- [ ] Accéder à `/admin` ✅

#### Test 4.3 : API - Tous les droits
- [ ] `GET /api/tickets` → **200 OK** (tous les tickets)
- [ ] `POST /api/tickets` → **201 Created**
- [ ] `GET /api/dashboard/stats` → **200 OK** (avec `tauxSlaRespect`)
- [ ] `POST /api/categories` → **201 Created** ✅
- [ ] `PATCH /api/categories/xxx` → **200 OK** ✅
- [ ] `DELETE /api/categories/xxx` → **200 OK** ✅
- [ ] `POST /api/sla` → **201 Created** ✅
- [ ] `POST /api/users` → **201 Created** ✅
- [ ] `DELETE /api/users/xxx` → **200 OK** ✅
- [ ] `POST /api/articles` → **201 Created** ✅

---

### **5. Tests ADMIN**

#### Test 5.1 : Accès identique au MANAGER
- [ ] Tous les tests MANAGER doivent passer ✅

---

## 🧪 Tests avec cURL

### **Test API - Client voit uniquement ses tickets**

```bash
# 1. Se connecter en tant que client
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"Test1234!"}' \
  -c cookies.txt

# 2. Récupérer les tickets
curl -X GET http://localhost:3000/api/tickets \
  -b cookies.txt

# Résultat attendu : Uniquement les tickets du client
```

### **Test API - Agent ne peut pas créer de catégorie**

```bash
# 1. Se connecter en tant qu'agent
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@test.com","password":"Test1234!"}' \
  -c cookies-agent.txt

# 2. Tenter de créer une catégorie
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test"}' \
  -b cookies-agent.txt

# Résultat attendu : 403 Forbidden
```

### **Test API - Manager peut créer une catégorie**

```bash
# 1. Se connecter en tant que manager
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"Test1234!"}' \
  -c cookies-manager.txt

# 2. Créer une catégorie
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Nouvelle Catégorie","description":"Test Manager"}' \
  -b cookies-manager.txt

# Résultat attendu : 201 Created
```

---

## 📊 Checklist Complète

### **Authentification**
- [ ] Redirection automatique vers `/login` au chargement
- [ ] Token JWT créé lors de la connexion
- [ ] Token stocké dans cookie HTTP-Only
- [ ] Token vérifié à chaque requête API
- [ ] Déconnexion supprime le token

### **CLIENT (Demandeur)**
- [ ] Accès uniquement à `/dashboard`, `/dashboard/tickets`, `/knowledge-base`
- [ ] Voit uniquement ses propres tickets
- [ ] Dashboard sans performances SLA/agents
- [ ] Peut créer des tickets
- [ ] Ne peut pas créer/modifier catégories, SLA, utilisateurs, articles

### **AGENT**
- [ ] Accès à toutes les pages sauf `/admin`
- [ ] Voit tous les tickets
- [ ] Dashboard avec performances SLA
- [ ] CRUD complet sur tickets
- [ ] Lecture seule sur catégories, SLA, utilisateurs
- [ ] Ne peut pas créer/modifier catégories, SLA, utilisateurs, articles

### **MANAGER & ADMIN**
- [ ] Accès complet à toutes les pages
- [ ] Tous les droits sur toutes les fonctionnalités
- [ ] Peut créer/modifier/supprimer tout

---

## 🐛 Problèmes Courants

### **Problème : Redirection infinie vers /login**
**Cause** : Token JWT invalide ou expiré  
**Solution** : Supprimer les cookies et se reconnecter

### **Problème : 403 Forbidden inattendu**
**Cause** : Permissions manquantes dans la matrice RBAC  
**Solution** : Vérifier `/lib/permissions.ts`

### **Problème : Client voit tous les tickets**
**Cause** : Filtrage non appliqué dans `/app/api/tickets/route.ts`  
**Solution** : Vérifier la clause `where` dans la requête Prisma

---

## ✅ Résultat Attendu

Si tous les tests passent :
- ✅ Le système de permissions fonctionne correctement
- ✅ Les clients sont isolés (voient uniquement leurs données)
- ✅ Les agents ont un accès en lecture seule (sauf tickets)
- ✅ Les managers/admins ont un accès complet
- ✅ L'application est sécurisée et prête pour la production

---

**Date** : 1er décembre 2024  
**Version** : 1.0
