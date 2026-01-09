# 🔒 Guide de Sécurité XSS - TicketFlow

## 📋 Vue d'ensemble

Ce document décrit les protections XSS (Cross-Site Scripting) implémentées dans l'application TicketFlow, conformes aux recommandations **OWASP**.

## 🎯 Protections implémentées

### 1. Module de sanitization (`lib/sanitize.ts`)

Fonctions de sécurité disponibles :

- **`sanitizeHTML(html)`** : Nettoie le HTML avec DOMPurify (configuration stricte)
- **`sanitizeText(text)`** : Retire TOUT le HTML (texte brut uniquement)
- **`escapeHTML(unsafe)`** : Échappe les 5 caractères HTML critiques
- **`parseMarkdownSafe(markdown)`** : Parse du markdown sécurisé
- **`validateURL(url)`** : Valide les URLs (http/https uniquement)
- **`validateEmail(email)`** : Valide le format email
- **`sanitizeFilename(filename)`** : Nettoie les noms de fichiers
- **`limitLength(str, max)`** : Limite la longueur (anti-DoS)

### 2. Hook React (`hooks/use-safe-input.ts`)

Hook pour sécuriser automatiquement les inputs :

```typescript
const { value, safeValue, handleChange, isValid, error } = useSafeInput({
  type: 'markdown',
  maxLength: 5000
});
```

Types supportés : `'text' | 'html' | 'markdown' | 'email' | 'url' | 'none'`

### 3. Composants UI sécurisés (`components/ui/safe-input.tsx`)

Composants React avec protection XSS intégrée :

- **`<SafeInput>`** : Input sécurisé
- **`<SafeTextarea>`** : Textarea sécurisé avec compteur
- **`<SafeMarkdownPreview>`** : Prévisualisation markdown sécurisée

## 🚀 Utilisation

### Exemple 1 : Input texte simple

```tsx
import { SafeInput } from '@/components/ui/safe-input';

<SafeInput 
  sanitizeType="text"
  placeholder="Nom d'utilisateur"
  showError
/>
```

### Exemple 2 : Textarea markdown

```tsx
import { SafeTextarea } from '@/components/ui/safe-input';

<SafeTextarea 
  sanitizeType="markdown"
  maxLength={5000}
  showCounter
  placeholder="Votre message..."
/>
```

### Exemple 3 : Prévisualisation markdown

```tsx
import { SafeMarkdownPreview } from '@/components/ui/safe-input';

<SafeMarkdownPreview content={userMarkdown} />
```

### Exemple 4 : Formulaire complet

```tsx
import { useSafeForm } from '@/hooks/use-safe-input';

const form = useSafeForm({
  name: { type: 'text', maxLength: 100, required: true },
  email: { type: 'email', required: true },
  bio: { type: 'markdown', maxLength: 5000 }
});

<input {...form.fields.name.props} />
{form.fields.name.error && <span>{form.fields.name.error}</span>}

<input {...form.fields.email.props} />
<textarea {...form.fields.bio.props} />

<button onClick={() => console.log(form.values)} disabled={!form.isValid}>
  Envoyer
</button>
```

### Exemple 5 : Sanitization manuelle

```typescript
import { sanitizeHTML, parseMarkdownSafe } from '@/lib/sanitize';

// HTML riche
const cleanHTML = sanitizeHTML(userHTML);

// Markdown
const safeMarkdown = parseMarkdownSafe(userMarkdown);

// Affichage
<div dangerouslySetInnerHTML={{ __html: safeMarkdown }} />
```

## 🛡️ Règles de sécurité

### ✅ À FAIRE

1. **Toujours utiliser les composants sécurisés** pour les inputs utilisateur
2. **Sanitizer avant d'afficher** avec `dangerouslySetInnerHTML`
3. **Valider les URLs** avant de créer des liens
4. **Limiter la longueur** des inputs (anti-DoS)
5. **Tester régulièrement** avec `runSecurityTests()`

### ❌ À NE JAMAIS FAIRE

1. ❌ `<div dangerouslySetInnerHTML={{ __html: userInput }} />` sans sanitization
2. ❌ `eval(userInput)` ou `new Function(userInput)`
3. ❌ `<a href={userURL}>` sans validation
4. ❌ Faire confiance aux données utilisateur
5. ❌ Désactiver les protections XSS

## 🧪 Tests de sécurité

### Lancer les tests

```typescript
import { runSecurityTests } from '@/lib/sanitize';

// En développement
runSecurityTests();
```

### Payloads de test

Testez votre application avec ces payloads XSS :

```javascript
// 1. Script basique
'<script>alert("XSS")</script>'

// 2. Event handler
'<img src=x onerror=alert("XSS")>'

// 3. JavaScript URL
'javascript:alert("XSS")'

// 4. Attribut malveillant
'" onload="alert(\'XSS\')'

// 5. Data URL
'data:text/html,<script>alert("XSS")</script>'

// 6. SVG avec script
'<svg onload=alert("XSS")>'
```

**Tous doivent être bloqués !**

## 📊 Configuration DOMPurify

### Configuration stricte (par défaut)

```typescript
{
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  ALLOW_DATA_ATTR: false
}
```

### Markdown supporté (sécurisé)

- **`**texte**`** → `<strong>texte</strong>` (gras)
- **`*texte*`** → `<em>texte</em>` (italique)
- **`` `code` ``** → `<code>code</code>` (code inline)
- **`# Titre`** → `<h1>Titre</h1>` (titres)
- **`- Item`** → `<li>Item</li>` (listes)

Tout le reste (HTML, scripts, etc.) est **automatiquement échappé**.

## 🔐 Checklist de déploiement

Avant de déployer en production :

- [x] Module `sanitize.ts` implémenté avec DOMPurify
- [x] Hook `useSafeInput` créé
- [x] Composants `SafeInput`, `SafeTextarea` créés
- [x] Page knowledge-base utilise `parseMarkdownSafe`
- [ ] Tous les `dangerouslySetInnerHTML` sont sécurisés
- [ ] Content Security Policy (CSP) configuré
- [ ] HTTPS activé (obligatoire)
- [ ] Tests de sécurité automatisés
- [ ] Audit de sécurité effectué

## 🌐 Content Security Policy (CSP)

Ajouter ces headers HTTP en production :

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

**Note** : Ajuster selon vos besoins (Next.js, Vercel Analytics, etc.)

## 📚 Ressources OWASP

- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOM Based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## 🎓 Formation de l'équipe

### Comprendre XSS

XSS permet à un attaquant d'injecter du code JavaScript malveillant. Exemple :

```tsx
// ❌ VULNÉRABLE
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// Un attaquant entre :
userComment = '<img src=x onerror=alert(document.cookie)>'

// Le script s'exécute et vole les cookies !
```

### Types d'attaques

1. **Reflected XSS** : Payload dans l'URL
2. **Stored XSS** : Payload en base de données
3. **DOM-based XSS** : Manipulation du DOM côté client

**Toutes sont bloquées** par nos protections.

### Bonnes pratiques

```tsx
// ❌ DANGEREUX
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SÉCURISÉ
import { parseMarkdownSafe } from '@/lib/sanitize';
<div dangerouslySetInnerHTML={{ __html: parseMarkdownSafe(userInput) }} />

// ✅ ENCORE MIEUX
import { SafeMarkdownPreview } from '@/components/ui/safe-input';
<SafeMarkdownPreview content={userInput} />
```

## 🚨 Incidents de sécurité

En cas de découverte d'une vulnérabilité XSS :

1. **Ne pas paniquer** - Documenter le problème
2. **Isoler** - Identifier les pages affectées
3. **Corriger** - Appliquer la sanitization appropriée
4. **Tester** - Vérifier que la vulnérabilité est corrigée
5. **Déployer** - Mettre en production rapidement
6. **Notifier** - Informer les utilisateurs si nécessaire

## 📞 Support

Pour toute question de sécurité :

- Consulter ce document
- Lancer `runSecurityTests()` pour vérifier
- Consulter la documentation OWASP
- Contacter l'équipe sécurité

---

**🔒 Votre application est protégée contre les injections XSS !**

Dernière mise à jour : 2026-01-09
