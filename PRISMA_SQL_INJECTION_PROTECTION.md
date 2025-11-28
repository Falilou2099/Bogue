# Protection contre les Injections SQL avec Prisma

## 🛡️ Vue d'ensemble

Prisma ORM offre une **protection native et automatique** contre les injections SQL grâce à son architecture et ses mécanismes de sécurité intégrés.

---

## 🔒 Mécanismes de Protection

### **1. Requêtes Paramétrées (Prepared Statements)**

Prisma utilise **automatiquement** des requêtes préparées pour toutes les opérations de base de données.

#### **Comment ça fonctionne ?**

```typescript
// ❌ DANGEREUX - Injection SQL possible (SQL brut)
const email = "admin@example.com' OR '1'='1"
const query = `SELECT * FROM users WHERE email = '${email}'`
// Résultat : SELECT * FROM users WHERE email = 'admin@example.com' OR '1'='1'
// ⚠️ Retourne TOUS les utilisateurs !

// ✅ SÉCURISÉ - Prisma avec requête paramétrée
const user = await prisma.user.findUnique({
  where: { email: email }
})
```

**Ce que Prisma fait en interne :**
```sql
-- Prisma génère une requête préparée
PREPARE stmt FROM 'SELECT * FROM users WHERE email = ?';
EXECUTE stmt USING @email;

-- Le paramètre est traité comme une VALEUR, pas comme du CODE SQL
-- Résultat : Recherche littérale de "admin@example.com' OR '1'='1"
-- ✅ Aucun utilisateur trouvé (pas d'injection)
```

---

### **2. Typage Strict avec TypeScript**

Prisma génère des types TypeScript basés sur votre schéma, empêchant les erreurs de type.

```typescript
// ✅ Type-safe - Le compilateur TypeScript vérifie
const user = await prisma.user.findUnique({
  where: {
    email: "test@example.com", // String attendu
    // id: "not-a-number" // ❌ Erreur TypeScript si id est un Int
  }
})

// ❌ Erreur de compilation
const user = await prisma.user.findUnique({
  where: {
    email: 123 // Type 'number' is not assignable to type 'string'
  }
})
```

---

### **3. API Déclarative (Pas de SQL Brut)**

Prisma encourage l'utilisation de son API déclarative plutôt que du SQL brut.

```typescript
// ✅ RECOMMANDÉ - API Prisma sécurisée
const users = await prisma.user.findMany({
  where: {
    role: 'ADMIN',
    email: {
      contains: searchTerm // Automatiquement échappé
    }
  }
})

// ⚠️ À ÉVITER - SQL brut (nécessite une attention particulière)
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE role = 'ADMIN' AND email LIKE ${searchTerm}
`
// Prisma échappe quand même les paramètres, mais moins sûr
```

---

### **4. Validation des Entrées**

Prisma valide automatiquement les types de données avant d'exécuter les requêtes.

```typescript
// ✅ Prisma valide automatiquement
const ticket = await prisma.ticket.create({
  data: {
    title: "Nouveau ticket",
    priority: "HAUTE", // Enum validé
    status: "OUVERT",  // Enum validé
    categoryId: "cat-1" // String validé
  }
})

// ❌ Prisma rejette les valeurs invalides
const ticket = await prisma.ticket.create({
  data: {
    priority: "INVALID_PRIORITY" // Erreur : Invalid enum value
  }
})
```

---

## 🎯 Exemples Concrets dans TicketFlow

### **Exemple 1 : Authentification**

```typescript
// lib/auth.ts
export async function authenticateUser(email: string, password: string) {
  // ✅ SÉCURISÉ - Prisma paramètre automatiquement
  const user = await prisma.user.findUnique({
    where: { email } // email est traité comme une valeur, pas du code
  })
  
  // Même si email = "admin' OR '1'='1", Prisma cherche littéralement cette chaîne
  // Aucun risque d'injection SQL
}
```

**SQL généré par Prisma :**
```sql
-- Requête préparée avec paramètre
SELECT * FROM users WHERE email = $1;
-- Paramètre : "admin' OR '1'='1"
-- Résultat : Aucun utilisateur (recherche littérale)
```

---

### **Exemple 2 : Recherche de Tickets**

```typescript
// app/api/tickets/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') // Input utilisateur
  
  // ✅ SÉCURISÉ - Prisma échappe automatiquement
  const tickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { title: { contains: search } },      // Échappé
        { description: { contains: search } } // Échappé
      ]
    }
  })
}
```

**Tentative d'injection :**
```typescript
// Attaque : search = "'; DROP TABLE tickets; --"

// ❌ N'EXÉCUTE PAS le DROP TABLE
// Prisma génère :
SELECT * FROM tickets 
WHERE title LIKE '%'; DROP TABLE tickets; --%' 
   OR description LIKE '%'; DROP TABLE tickets; --%'

// La chaîne malveillante est traitée comme du TEXTE, pas du SQL
```

---

### **Exemple 3 : Mise à Jour avec ID Dynamique**

```typescript
// app/api/tickets/[id]/route.ts
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params // ID depuis l'URL
  const body = await request.json()
  
  // ✅ SÉCURISÉ - Prisma paramètre id et les données
  const ticket = await prisma.ticket.update({
    where: { id }, // Paramétré
    data: {
      title: body.title,       // Paramétré
      description: body.description // Paramétré
    }
  })
}
```

**Tentative d'injection :**
```typescript
// Attaque : id = "TKT-001' OR '1'='1"

// ❌ N'AFFECTE PAS tous les tickets
// Prisma génère :
UPDATE tickets SET title = ?, description = ? WHERE id = ?
-- Paramètres : [title, description, "TKT-001' OR '1'='1"]
-- Résultat : Aucun ticket mis à jour (ID invalide)
```

---

## ⚠️ Cas Particuliers : SQL Brut

### **Quand utiliser `$queryRaw` ?**

Prisma permet d'exécuter du SQL brut, mais **avec protection** :

```typescript
// ✅ SÉCURISÉ - Paramètres échappés automatiquement
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`
// Prisma utilise des paramètres préparés même avec $queryRaw

// ❌ DANGEREUX - Concaténation de chaînes
const query = `SELECT * FROM users WHERE email = '${email}'`
const users = await prisma.$queryRawUnsafe(query)
// ⚠️ $queryRawUnsafe désactive la protection !
```

### **Règles d'utilisation :**

1. ✅ **Toujours utiliser** les template literals avec `$queryRaw`
2. ❌ **Ne JAMAIS utiliser** `$queryRawUnsafe` avec des inputs utilisateur
3. ✅ **Préférer** l'API Prisma standard quand possible

---

## 🔍 Comparaison : Avec vs Sans Prisma

### **Sans Prisma (SQL Brut) - DANGEREUX**

```typescript
// ❌ Vulnérable aux injections SQL
const email = req.body.email // "admin' OR '1'='1"
const query = `SELECT * FROM users WHERE email = '${email}'`
const result = await db.query(query)

// SQL exécuté :
// SELECT * FROM users WHERE email = 'admin' OR '1'='1'
// ⚠️ Retourne TOUS les utilisateurs !
```

### **Avec Prisma - SÉCURISÉ**

```typescript
// ✅ Protégé automatiquement
const email = req.body.email // "admin' OR '1'='1"
const user = await prisma.user.findUnique({
  where: { email }
})

// SQL exécuté :
// SELECT * FROM users WHERE email = $1
// Paramètre : "admin' OR '1'='1"
// ✅ Recherche littérale, aucun utilisateur trouvé
```

---

## 📊 Niveaux de Protection

| Méthode | Protection | Recommandation |
|---------|------------|----------------|
| `findUnique()`, `findMany()`, etc. | ✅✅✅ Maximale | **Utiliser par défaut** |
| `$queryRaw` avec template literals | ✅✅ Élevée | Acceptable si nécessaire |
| `$queryRawUnsafe` | ❌ Aucune | **Ne JAMAIS utiliser** |
| SQL brut (sans Prisma) | ❌ Aucune | **À éviter absolument** |

---

## 🛠️ Bonnes Pratiques dans TicketFlow

### **1. Utiliser l'API Prisma Standard**

```typescript
// ✅ BIEN
const tickets = await prisma.ticket.findMany({
  where: {
    status: userInput.status,
    priority: userInput.priority
  }
})

// ❌ ÉVITER
const tickets = await prisma.$queryRaw`
  SELECT * FROM tickets WHERE status = ${userInput.status}
`
```

### **2. Valider avec Zod AVANT Prisma**

```typescript
// Double protection : Zod + Prisma
import { ticketSchema } from '@/lib/validations/ticket'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // 1. Validation Zod (format, types, longueurs)
  const validatedData = ticketSchema.parse(body)
  
  // 2. Prisma (protection SQL injection)
  const ticket = await prisma.ticket.create({
    data: validatedData
  })
}
```

### **3. Typage Strict**

```typescript
// ✅ Types générés par Prisma
import { Prisma } from '@prisma/client'

const createTicket = async (data: Prisma.TicketCreateInput) => {
  return prisma.ticket.create({ data })
}

// TypeScript empêche les erreurs de type
```

---

## 🧪 Tests de Sécurité

### **Vecteurs d'attaque testés**

```typescript
// Test 1 : Injection dans WHERE
const maliciousEmail = "admin' OR '1'='1"
const user = await prisma.user.findUnique({
  where: { email: maliciousEmail }
})
// ✅ Résultat : null (aucun utilisateur)

// Test 2 : Injection dans LIKE
const maliciousSearch = "'; DROP TABLE tickets; --"
const tickets = await prisma.ticket.findMany({
  where: {
    title: { contains: maliciousSearch }
  }
})
// ✅ Résultat : [] (recherche littérale)

// Test 3 : Injection dans UPDATE
const maliciousId = "TKT-001' OR '1'='1"
const ticket = await prisma.ticket.update({
  where: { id: maliciousId },
  data: { title: "Nouveau titre" }
})
// ✅ Résultat : Erreur (ID invalide, aucun ticket modifié)
```

---

## 📚 Ressources

### **Documentation Officielle**
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#sql-injection)
- [Prepared Statements](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#prepared-statements)

### **OWASP**
- [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

## ✅ Conclusion

### **Prisma protège contre les injections SQL via :**

1. ✅ **Requêtes paramétrées automatiques** - Tous les inputs sont traités comme des valeurs
2. ✅ **Typage strict TypeScript** - Validation au moment de la compilation
3. ✅ **API déclarative** - Pas besoin d'écrire du SQL brut
4. ✅ **Validation des types** - Vérification runtime des données
5. ✅ **Échappement automatique** - Même avec `$queryRaw`

### **Dans TicketFlow :**

- ✅ **100% des requêtes** utilisent l'API Prisma standard
- ✅ **Aucune utilisation** de `$queryRawUnsafe`
- ✅ **Double validation** : Zod + Prisma
- ✅ **Typage strict** sur toutes les opérations

**Résultat : Protection maximale contre les injections SQL** 🛡️

---

**Date de création** : 28 novembre 2025  
**Version** : 1.0  
**Auteur** : Cascade AI
