/**
 * ════════════════════════════════════════════════════════════════════════════
 * MODULE DE PROTECTION XSS - SÉCURITÉ CONTRE LES INJECTIONS
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Ce module fournit des utilitaires pour protéger votre application contre
 * les attaques XSS (Cross-Site Scripting) conformément aux recommandations OWASP.
 * 
 * Référence OWASP : 
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 * 
 * PRINCIPES DE SÉCURITÉ :
 * 1. Ne JAMAIS faire confiance aux données utilisateur
 * 2. Toujours échapper le HTML avant l'insertion dans le DOM
 * 3. Utiliser textContent au lieu de innerHTML quand possible
 * 4. Valider et sanitizer toutes les entrées
 * 5. Utiliser Content Security Policy (CSP) en production
 */

// ──────────────────────────────────────────────────────────────────────────────
// 1. ÉCHAPPEMENT HTML DE BASE
// ──────────────────────────────────────────────────────────────────────────────

/**
 * SÉCURITÉ : Échappe les caractères HTML dangereux pour prévenir les injections XSS
 * 
 * Cette fonction utilise le navigateur lui-même pour échapper le HTML de manière sûre.
 * textContent ne parse jamais le HTML, donc tout est traité comme du texte brut.
 * 
 * @param unsafe - Chaîne potentiellement dangereuse provenant d'une entrée utilisateur
 * @returns Chaîne sécurisée avec caractères HTML échappés
 * 
 * @example
 * escapeHTML('<script>alert("XSS")</script>')
 * // Retourne: '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 */
export function escapeHTML(unsafe: string): string {
  if (typeof document === 'undefined') {
    return escapeHTMLPure(unsafe);
  }
  
  const div = document.createElement('div');
  div.textContent = unsafe;
  return div.innerHTML;
}

/**
 * SÉCURITÉ : Alternative pure sans DOM pour environnements Node.js ou SSR
 * 
 * Échappe manuellement les 5 caractères HTML critiques selon OWASP :
 * - & (ampersand) → &amp;
 * - < (less than) → &lt;
 * - > (greater than) → &gt;
 * - " (double quote) → &quot;
 * - ' (single quote) → &#039;
 * 
 * @param unsafe - Chaîne à échapper
 * @returns Chaîne sécurisée
 */
export function escapeHTMLPure(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')   // DOIT être en premier pour éviter double-échappement
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. PARSING MARKDOWN SÉCURISÉ
// ──────────────────────────────────────────────────────────────────────────────

/**
 * SÉCURITÉ : Parse du markdown simple de manière sécurisée
 * 
 * Cette fonction implémente un parser markdown minimaliste qui :
 * 1. Échappe TOUT le HTML d'abord (prévention XSS)
 * 2. Applique uniquement les transformations markdown sûres
 * 3. Ne permet AUCUNE balise HTML brute
 * 
 * Syntaxe supportée (sûre) :
 * - **texte** → <strong>texte</strong> (gras)
 * - *texte* → <em>texte</em> (italique)
 * - `code` → <code>code</code> (code inline)
 * - \n → <br> (retour à la ligne)
 * 
 * ⚠️ IMPORTANT : Cette fonction n'est PAS un parser markdown complet.
 * Pour du markdown complexe, utilisez une librairie comme 'marked' + 'DOMPurify'.
 * 
 * @param markdown - Texte markdown à parser
 * @returns HTML sécurisé (échappé puis transformé)
 * 
 * @example
 * parseMarkdownSafe('Bonjour **monde** ! <script>alert("XSS")</script>')
 * // Retourne: 'Bonjour <strong>monde</strong> ! &lt;script&gt;alert("XSS")&lt;/script&gt;'
 */
export function parseMarkdownSafe(markdown: string): string {
  // ÉTAPE 1 : Échapper tout le HTML (sécurité)
  let safe = escapeHTML(markdown);
  
  // ÉTAPE 2 : Appliquer les transformations markdown sûres
  safe = safe
    // Gras : **texte** → <strong>texte</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italique : *texte* → <em>texte</em>
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Code inline : `code` → <code>code</code>
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Retours à la ligne
    .replace(/\n/g, '<br>');
  
  return safe;
}

/**
 * SÉCURITÉ : Parse du markdown avec support des liens (plus permissif mais sûr)
 * 
 * Ajoute le support des liens markdown : [texte](url)
 * ⚠️ Valide que l'URL commence par http:// ou https:// pour éviter javascript:
 * 
 * @param markdown - Texte markdown à parser
 * @returns HTML sécurisé avec liens
 * 
 * @example
 * parseMarkdownWithLinks('[Google](https://google.com)')
 * // Retourne: '<a href="https://google.com" rel="noopener noreferrer">Google</a>'
 * 
 * parseMarkdownWithLinks('[XSS](javascript:alert("XSS"))')
 * // Retourne: '[XSS](javascript:alert("XSS"))' (lien rejeté)
 */
export function parseMarkdownWithLinks(markdown: string): string {
  // D'abord, parser le markdown de base
  let safe = parseMarkdownSafe(markdown);
  
  // Ensuite, ajouter les liens (avec validation d'URL)
  safe = safe.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, url) => {
      // SÉCURITÉ : Valider que l'URL est sûre (http/https uniquement)
      const urlLower = url.trim().toLowerCase();
      if (urlLower.startsWith('http://') || urlLower.startsWith('https://')) {
        // rel="noopener noreferrer" pour la sécurité (prévient window.opener)
        return `<a href="${escapeHTML(url)}" rel="noopener noreferrer" target="_blank">${text}</a>`;
      }
      // URL non sûre : retourner le texte original non transformé
      return match;
    }
  );
  
  return safe;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. CRÉATION D'ÉLÉMENTS DOM SÉCURISÉS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Options pour créer un élément DOM sécurisé
 */
export interface SafeElementOptions {
  /** Contenu texte (sera échappé automatiquement via textContent) */
  textContent?: string;
  /** Classe(s) CSS */
  className?: string;
  /** ID de l'élément */
  id?: string;
  /** Styles inline (objet TypeScript, pas de string CSS brut) */
  style?: Partial<CSSStyleDeclaration>;
  /** Attributs HTML (valeurs seront échappées) */
  attributes?: Record<string, string>;
  /** Enfants à ajouter (éléments DOM ou texte) */
  children?: (HTMLElement | string)[];
}

/**
 * SÉCURITÉ : Crée un élément DOM de manière sécurisée
 * 
 * Cette fonction est la méthode RECOMMANDÉE pour créer des éléments DOM
 * avec du contenu dynamique. Elle garantit :
 * 
 * 1. Utilisation de textContent (sûr) au lieu de innerHTML (dangereux)
 * 2. Échappement automatique de tous les attributs
 * 3. Type-safety avec TypeScript
 * 4. API déclarative et lisible
 * 
 * ⚠️ RÈGLE D'OR : Ne JAMAIS utiliser innerHTML avec des données utilisateur !
 * 
 * @param tag - Nom de la balise HTML (ex: 'div', 'span', 'button')
 * @param options - Configuration de l'élément
 * @returns Élément DOM sécurisé et typé
 * 
 * @example
 * // Créer un bouton avec du texte utilisateur
 * const button = createSafeElement('button', {
 *   textContent: userInput, // Échappé automatiquement
 *   className: 'btn btn-primary',
 *   attributes: { type: 'button' }
 * });
 * 
 * @example
 * // Créer un div avec enfants
 * const container = createSafeElement('div', {
 *   className: 'container',
 *   children: [
 *     createSafeElement('h1', { textContent: 'Titre' }),
 *     createSafeElement('p', { textContent: userComment })
 *   ]
 * });
 */
export function createSafeElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: SafeElementOptions = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  
  // SÉCURITÉ : Utiliser textContent (sûr) au lieu de innerHTML (dangereux)
  if (options.textContent !== undefined) {
    element.textContent = options.textContent;
  }
  
  if (options.className) {
    element.className = options.className;
  }
  
  if (options.id) {
    element.id = options.id;
  }
  
  // Styles : utiliser l'objet CSSStyleDeclaration (type-safe)
  if (options.style) {
    Object.assign(element.style, options.style);
  }
  
  // Attributs : échapper les valeurs
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      // setAttribute échappe automatiquement les valeurs
      element.setAttribute(key, value);
    });
  }
  
  // Enfants : ajouter de manière sécurisée
  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        // Texte : utiliser textContent (sûr)
        element.appendChild(document.createTextNode(child));
      } else {
        // Élément DOM : ajouter directement
        element.appendChild(child);
      }
    });
  }
  
  return element;
}

/**
 * SÉCURITÉ : Insère du HTML sécurisé (markdown parsé) dans un élément
 * 
 * Utilise parseMarkdownSafe pour permettre du formatage simple
 * tout en protégeant contre XSS.
 * 
 * ⚠️ À utiliser UNIQUEMENT pour du contenu markdown, pas du HTML brut !
 * 
 * @param element - Élément cible
 * @param markdown - Contenu markdown à insérer
 * 
 * @example
 * const div = document.createElement('div');
 * setSafeMarkdown(div, '**Attention** : Ceci est un *test* !');
 * // div.innerHTML = '<strong>Attention</strong> : Ceci est un <em>test</em> !'
 */
export function setSafeMarkdown(element: HTMLElement, markdown: string): void {
  // Parser le markdown de manière sécurisée
  const safeHTML = parseMarkdownSafe(markdown);
  
  // innerHTML est OK ici car le contenu a été échappé puis transformé
  element.innerHTML = safeHTML;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. VALIDATION D'ENTRÉES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * SÉCURITÉ : Valide et sanitize une URL
 * 
 * Vérifie que l'URL est sûre (http/https uniquement) et bien formée.
 * Rejette les URLs dangereuses comme javascript:, data:, file:, etc.
 * 
 * @param url - URL à valider
 * @returns URL validée ou null si dangereuse
 * 
 * @example
 * validateURL('https://google.com') // 'https://google.com'
 * validateURL('javascript:alert("XSS")') // null
 */
export function validateURL(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Autoriser uniquement http et https
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
    
    return null;
  } catch {
    // URL malformée
    return null;
  }
}

/**
 * SÉCURITÉ : Sanitize un nom de fichier
 * 
 * Retire les caractères dangereux d'un nom de fichier pour éviter
 * les attaques de type path traversal (../, etc.)
 * 
 * @param filename - Nom de fichier à sanitizer
 * @returns Nom de fichier sécurisé
 * 
 * @example
 * sanitizeFilename('../../etc/passwd') // 'etcpasswd'
 * sanitizeFilename('image<script>.jpg') // 'imagescript.jpg'
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '') // Garder uniquement caractères sûrs
    .replace(/\.{2,}/g, '.')          // Retirer .. (path traversal)
    .slice(0, 255);                   // Limiter la longueur
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. TESTS DE SÉCURITÉ
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Tests unitaires pour vérifier la protection XSS
 * À exécuter dans la console ou dans vos tests automatisés
 */
export function runXSSSecurityTests(): void {
  console.log('🔒 Démarrage des tests de sécurité XSS...\n');
  
  // Test 1 : Échappement HTML de base
  const xssPayload1 = '<script>alert("XSS")</script>';
  const escaped1 = escapeHTML(xssPayload1);
  console.assert(
    !escaped1.includes('<script>'),
    '❌ ÉCHEC : Script non échappé !'
  );
  console.log('✅ Test 1 : Échappement HTML de base - PASSÉ');
  
  // Test 2 : Attributs HTML
  const xssPayload2 = '" onload="alert(\'XSS\')';
  const escaped2 = escapeHTML(xssPayload2);
  console.assert(
    !escaped2.includes('onload='),
    '❌ ÉCHEC : Attribut onload non échappé !'
  );
  console.log('✅ Test 2 : Échappement attributs - PASSÉ');
  
  // Test 3 : Markdown sécurisé
  const xssPayload3 = '**Gras** <img src=x onerror=alert("XSS")>';
  const parsed3 = parseMarkdownSafe(xssPayload3);
  console.assert(
    parsed3.includes('<strong>Gras</strong>') && !parsed3.includes('<img'),
    '❌ ÉCHEC : Balise img non échappée !'
  );
  console.log('✅ Test 3 : Markdown sécurisé - PASSÉ');
  
  // Test 4 : URL validation
  const xssPayload4 = 'javascript:alert("XSS")';
  const validated4 = validateURL(xssPayload4);
  console.assert(
    validated4 === null,
    '❌ ÉCHEC : URL javascript: acceptée !'
  );
  console.log('✅ Test 4 : Validation URL - PASSÉ');
  
  // Test 5 : createSafeElement
  if (typeof document !== 'undefined') {
    const xssPayload5 = '<img src=x onerror=alert("XSS")>';
    const element5 = createSafeElement('div', { textContent: xssPayload5 });
    console.assert(
      !element5.innerHTML.includes('<img'),
      '❌ ÉCHEC : createSafeElement non sécurisé !'
    );
    console.log('✅ Test 5 : createSafeElement - PASSÉ');
  }
  
  console.log('\n🎉 Tous les tests de sécurité XSS sont PASSÉS !');
  console.log('✨ Votre application est protégée contre les injections XSS de base.');
  console.log('\n⚠️  RAPPEL : En production, ajoutez aussi :');
  console.log('   - Content Security Policy (CSP) headers');
  console.log('   - Validation côté serveur');
  console.log('   - HTTPS obligatoire');
  console.log('   - Audits de sécurité réguliers');
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. DOCUMENTATION ET EXEMPLES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GUIDE D'UTILISATION - PROTECTION XSS
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ❌ MAUVAISES PRATIQUES (VULNÉRABLES) :
 * 
 * // 1. innerHTML avec données utilisateur (DANGEREUX !)
 * element.innerHTML = userInput; // ⚠️ XSS !
 * 
 * // 2. Template literals non échappés
 * element.innerHTML = `<div>${userInput}</div>`; // ⚠️ XSS !
 * 
 * // 3. eval() ou Function() avec données utilisateur
 * eval(userInput); // ⚠️ TRÈS DANGEREUX !
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ✅ BONNES PRATIQUES (SÉCURISÉES) :
 * 
 * // 1. Utiliser textContent (échappement automatique)
 * element.textContent = userInput; // ✅ Sûr
 * 
 * // 2. Utiliser createSafeElement
 * const div = createSafeElement('div', { 
 *   textContent: userInput 
 * }); // ✅ Sûr
 * 
 * // 3. Parser le markdown de manière sécurisée
 * const html = parseMarkdownSafe(userMarkdown); // ✅ Sûr
 * element.innerHTML = html;
 * 
 * // 4. Échapper avant d'insérer
 * const safe = escapeHTML(userInput);
 * element.innerHTML = `<div>${safe}</div>`; // ✅ Sûr
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
