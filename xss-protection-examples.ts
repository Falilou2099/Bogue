/**
 * ════════════════════════════════════════════════════════════════════════════
 * EXEMPLES D'APPLICATION DE LA PROTECTION XSS
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier montre comment appliquer les protections XSS du module
 * xss-protection.ts à votre application Movie Explorer existante.
 */

import {
  escapeHTML,
  parseMarkdownSafe,
  createSafeElement,
  setSafeMarkdown,
  validateURL,
  runXSSSecurityTests,
  type SafeElementOptions
} from './xss-protection';

// ══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 1 : CORRECTION DU HUD DE PROGRESSION (LIGNE 179)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ❌ VERSION VULNÉRABLE (AVANT) :
 * 
 * const hud = document.createElement('div');
 * hud.id = 'progress-hud';
 * hud.innerHTML = `
 *   <h3>🎯 Progression</h3>
 *   <div class="progress-bar">
 *     <div class="progress-fill" style="width: 0%"></div>
 *   </div>
 *   ...
 * `;
 * 
 * Problème : innerHTML avec du contenu statique (risque faible mais mauvaise pratique)
 */

/**
 * ✅ VERSION SÉCURISÉE (APRÈS) :
 */
function initProgressHUDSecure(): void {
  if (typeof document === 'undefined') return;
  
  // Créer HUD si n'existe pas - VERSION SÉCURISÉE
  if (!document.getElementById('progress-hud')) {
    const hud = createSafeElement('div', { id: 'progress-hud' });
    
    // Titre
    const title = createSafeElement('h3', { textContent: '🎯 Progression' });
    hud.appendChild(title);
    
    // Barre de progression
    const progressBar = createSafeElement('div', { className: 'progress-bar' });
    const progressFill = createSafeElement('div', { 
      className: 'progress-fill',
      style: { width: '0%' }
    });
    progressBar.appendChild(progressFill);
    hud.appendChild(progressBar);
    
    // Stats
    const stats = createSafeElement('div', { className: 'progress-stats' });
    
    // Stat passée
    const passedSpan = createSafeElement('span');
    passedSpan.textContent = '✅ ';
    const passedValue = createSafeElement('span', { 
      className: 'stat-passed',
      textContent: '0'
    });
    passedSpan.appendChild(passedValue);
    
    // Stat pourcentage
    const percentSpan = createSafeElement('span');
    percentSpan.textContent = '📊 ';
    const percentValue = createSafeElement('span', { 
      id: 'progress-percent',
      textContent: '0%'
    });
    percentSpan.appendChild(percentValue);
    
    // Stat échouée
    const failedSpan = createSafeElement('span');
    failedSpan.textContent = '❌ ';
    const failedValue = createSafeElement('span', { 
      className: 'stat-failed',
      textContent: '0'
    });
    failedSpan.appendChild(failedValue);
    
    stats.appendChild(passedSpan);
    stats.appendChild(percentSpan);
    stats.appendChild(failedSpan);
    hud.appendChild(stats);
    
    // Total
    const totalDiv = createSafeElement('div', {
      style: { marginTop: '15px', fontSize: '12px', opacity: '0.9' }
    });
    totalDiv.textContent = 'Total: ';
    const totalValue = createSafeElement('span', { 
      id: 'progress-total',
      textContent: '0/50'
    });
    totalDiv.appendChild(totalValue);
    hud.appendChild(totalDiv);
    
    document.body.appendChild(hud);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 2 : CORRECTION DU BADGE D'ACHIEVEMENT (LIGNE 266) - CRITIQUE !
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ❌ VERSION VULNÉRABLE (AVANT) :
 * 
 * function showAchievement(text: string) {
 *   const badge = document.createElement('div');
 *   badge.className = 'achievement';
 *   badge.innerHTML = `🏆 ${text}`;  // ⚠️ INJECTION XSS POSSIBLE !
 *   document.body.appendChild(badge);
 * }
 * 
 * Problème CRITIQUE : Si 'text' provient d'une entrée utilisateur,
 * un attaquant peut injecter du code malveillant :
 * 
 * showAchievement('<img src=x onerror=alert("XSS")>');
 * // Le script s'exécuterait !
 */

/**
 * ✅ VERSION SÉCURISÉE (APRÈS) :
 */
function showAchievementSecure(text: string): void {
  if (typeof document === 'undefined') return;
  
  // SÉCURITÉ : Utiliser textContent au lieu de innerHTML
  // textContent échappe automatiquement tout le HTML
  const badge = createSafeElement('div', {
    className: 'achievement',
    textContent: `🏆 ${text}` // ✅ Sûr : textContent échappe automatiquement
  });
  
  document.body.appendChild(badge);
  
  setTimeout(() => badge.remove(), 3000);
}

// Test de sécurité
function testShowAchievementSecurity(): void {
  console.log('🔒 Test de sécurité showAchievement...');
  
  // Tentative d'injection XSS
  const xssPayload = '<img src=x onerror=alert("XSS")>';
  showAchievementSecure(xssPayload);
  
  // Vérifier que le badge contient le texte échappé, pas le script
  setTimeout(() => {
    const badge = document.querySelector('.achievement');
    if (badge && !badge.innerHTML.includes('<img')) {
      console.log('✅ Protection XSS effective : script bloqué');
    } else {
      console.error('❌ VULNÉRABILITÉ XSS détectée !');
    }
  }, 100);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 3 : AFFICHAGE SÉCURISÉ DES FILMS AVEC MARKDOWN
// ══════════════════════════════════════════════════════════════════════════════

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  description?: string; // Description peut contenir du markdown
}

/**
 * Affiche une carte de film de manière sécurisée
 * Supporte le markdown dans la description tout en protégeant contre XSS
 */
function renderMovieCardSecure(movie: Movie): HTMLElement {
  // Container principal
  const card = createSafeElement('div', {
    className: 'movie-card',
    attributes: { 'data-movie-id': String(movie.id) }
  });
  
  // Titre (textContent = sûr)
  const title = createSafeElement('h2', {
    className: 'movie-title',
    textContent: movie.title // ✅ Échappé automatiquement
  });
  card.appendChild(title);
  
  // Année et rating
  const meta = createSafeElement('div', {
    className: 'movie-meta',
    textContent: `${movie.year} • ⭐ ${movie.rating}/10`
  });
  card.appendChild(meta);
  
  // Genres (chaque genre est échappé)
  const genresContainer = createSafeElement('div', { className: 'movie-genres' });
  movie.genres.forEach(genre => {
    const genreTag = createSafeElement('span', {
      className: 'genre-tag',
      textContent: genre // ✅ Échappé automatiquement
    });
    genresContainer.appendChild(genreTag);
  });
  card.appendChild(genresContainer);
  
  // Description avec markdown sécurisé
  if (movie.description) {
    const description = createSafeElement('div', { className: 'movie-description' });
    // Parser le markdown de manière sécurisée
    setSafeMarkdown(description, movie.description);
    card.appendChild(description);
  }
  
  return card;
}

// Exemple d'utilisation
function displayMoviesSecure(movies: Movie[]): void {
  const container = document.getElementById('movies-container');
  if (!container) return;
  
  // Vider le container de manière sûre
  container.textContent = '';
  
  // Ajouter chaque film
  movies.forEach(movie => {
    const card = renderMovieCardSecure(movie);
    container.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 4 : FORMULAIRE DE RECHERCHE SÉCURISÉ
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Crée un formulaire de recherche avec protection XSS
 */
function createSearchFormSecure(): HTMLElement {
  const form = createSafeElement('form', {
    className: 'search-form',
    attributes: { role: 'search' }
  });
  
  // Label
  const label = createSafeElement('label', {
    textContent: 'Rechercher un film :',
    attributes: { for: 'search-input' }
  });
  form.appendChild(label);
  
  // Input
  const input = createSafeElement('input', {
    id: 'search-input',
    className: 'search-input',
    attributes: {
      type: 'text',
      placeholder: 'Titre, genre, année...',
      'aria-label': 'Recherche de films'
    }
  });
  form.appendChild(input);
  
  // Bouton
  const button = createSafeElement('button', {
    textContent: '🔍 Rechercher',
    className: 'search-button',
    attributes: { type: 'submit' }
  });
  form.appendChild(button);
  
  // Gestionnaire de soumission sécurisé
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const searchQuery = (input as HTMLInputElement).value;
    
    // SÉCURITÉ : Échapper la requête avant de l'afficher
    const safeQuery = escapeHTML(searchQuery);
    
    // Afficher les résultats de manière sécurisée
    displaySearchResults(safeQuery);
  });
  
  return form;
}

function displaySearchResults(query: string): void {
  const resultsDiv = document.getElementById('search-results');
  if (!resultsDiv) return;
  
  // Créer le message de résultats de manière sécurisée
  const message = createSafeElement('p', {
    className: 'search-message'
  });
  
  // Utiliser textContent pour la partie dynamique
  message.textContent = `Résultats pour : "${query}"`;
  
  resultsDiv.textContent = ''; // Vider
  resultsDiv.appendChild(message);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 5 : COMMENTAIRES UTILISATEUR AVEC MARKDOWN
// ══════════════════════════════════════════════════════════════════════════════

interface Comment {
  id: number;
  author: string;
  content: string; // Markdown
  timestamp: Date;
}

/**
 * Affiche un commentaire utilisateur de manière sécurisée
 * Permet le markdown mais bloque les injections XSS
 */
function renderCommentSecure(comment: Comment): HTMLElement {
  const commentDiv = createSafeElement('div', {
    className: 'comment',
    attributes: { 'data-comment-id': String(comment.id) }
  });
  
  // Header avec auteur et date
  const header = createSafeElement('div', { className: 'comment-header' });
  
  const author = createSafeElement('strong', {
    className: 'comment-author',
    textContent: comment.author // ✅ Échappé
  });
  header.appendChild(author);
  
  const timestamp = createSafeElement('time', {
    className: 'comment-time',
    textContent: ` • ${comment.timestamp.toLocaleDateString()}`,
    attributes: { datetime: comment.timestamp.toISOString() }
  });
  header.appendChild(timestamp);
  
  commentDiv.appendChild(header);
  
  // Contenu avec markdown sécurisé
  const content = createSafeElement('div', { className: 'comment-content' });
  setSafeMarkdown(content, comment.content); // ✅ Markdown parsé de manière sûre
  commentDiv.appendChild(content);
  
  return commentDiv;
}

// Test avec payload XSS
function testCommentSecurity(): void {
  console.log('🔒 Test de sécurité des commentaires...');
  
  const maliciousComment: Comment = {
    id: 1,
    author: '<script>alert("XSS")</script>',
    content: '**Commentaire** avec <img src=x onerror=alert("XSS")> injection',
    timestamp: new Date()
  };
  
  const commentElement = renderCommentSecure(maliciousComment);
  document.body.appendChild(commentElement);
  
  // Vérifier que les scripts sont bloqués
  setTimeout(() => {
    const html = commentElement.innerHTML;
    if (!html.includes('<script>') && !html.includes('onerror=')) {
      console.log('✅ Protection XSS des commentaires effective');
    } else {
      console.error('❌ VULNÉRABILITÉ XSS dans les commentaires !');
    }
    commentElement.remove();
  }, 100);
}

// ══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 6 : POPUP MODALE SÉCURISÉE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Crée une popup modale sécurisée avec titre et contenu markdown
 */
function showModalSecure(title: string, content: string): void {
  // Overlay
  const overlay = createSafeElement('div', {
    className: 'modal-overlay',
    attributes: { role: 'dialog', 'aria-modal': 'true' }
  });
  
  // Modal
  const modal = createSafeElement('div', { className: 'modal' });
  
  // Header
  const header = createSafeElement('div', { className: 'modal-header' });
  const titleElement = createSafeElement('h2', {
    textContent: title // ✅ Échappé
  });
  header.appendChild(titleElement);
  
  const closeButton = createSafeElement('button', {
    textContent: '✕',
    className: 'modal-close',
    attributes: { 'aria-label': 'Fermer' }
  });
  closeButton.addEventListener('click', () => overlay.remove());
  header.appendChild(closeButton);
  
  modal.appendChild(header);
  
  // Body avec markdown
  const body = createSafeElement('div', { className: 'modal-body' });
  setSafeMarkdown(body, content); // ✅ Markdown sécurisé
  modal.appendChild(body);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Fermer en cliquant sur l'overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TESTS ET DÉMONSTRATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Lance tous les tests de sécurité
 */
export function runAllSecurityTests(): void {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔒 TESTS DE SÉCURITÉ XSS - MOVIE EXPLORER');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Tests du module de base
  runXSSSecurityTests();
  
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('🎬 Tests spécifiques à l\'application\n');
  
  // Tests des composants
  testShowAchievementSecurity();
  testCommentSecurity();
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✨ Tous les tests sont terminés !');
  console.log('═══════════════════════════════════════════════════════════');
}

/**
 * Démonstration interactive
 */
export function runSecurityDemo(): void {
  console.log('🎭 Démonstration de protection XSS\n');
  
  // Exemple de film avec tentative d'injection
  const maliciousMovie: Movie = {
    id: 999,
    title: 'Film <script>alert("XSS")</script>',
    year: 2024,
    rating: 9.9,
    genres: ['<img src=x onerror=alert("XSS")>', 'Action'],
    description: '**Synopsis** : Un film avec `code` et <script>alert("XSS")</script>'
  };
  
  console.log('Tentative d\'injection XSS dans un film...');
  const card = renderMovieCardSecure(maliciousMovie);
  
  // Vérifier que le HTML est sûr
  const html = card.innerHTML;
  if (!html.includes('<script>') && !html.includes('onerror=')) {
    console.log('✅ Film affiché en toute sécurité !');
    console.log('Le HTML malveillant a été échappé.');
  }
  
  // Afficher la carte (optionnel)
  if (typeof document !== 'undefined') {
    document.body.appendChild(card);
    setTimeout(() => card.remove(), 3000);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT DES FONCTIONS SÉCURISÉES
// ══════════════════════════════════════════════════════════════════════════════

export {
  initProgressHUDSecure,
  showAchievementSecure,
  renderMovieCardSecure,
  displayMoviesSecure,
  createSearchFormSecure,
  renderCommentSecure,
  showModalSecure
};
