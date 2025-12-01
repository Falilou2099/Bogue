/**
 * Script d'analyse SonarQube pour TicketFlow
 * 
 * Usage:
 *   node scripts/sonar-scan.js
 * 
 * Prérequis:
 *   - SonarQube en cours d'exécution sur http://localhost:9000
 *   - Token généré dans SonarQube
 */

const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.projectKey': 'ticketflow',
      'sonar.projectName': 'TicketFlow - Système de Gestion de Tickets',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': 'app,components,lib,hooks',
      'sonar.tests': '__tests__',
      'sonar.exclusions': '**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/coverage/**,.next/**,out/**,public/**,styles/**',
      'sonar.sourceEncoding': 'UTF-8',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  (error) => {
    if (error) {
      console.error('❌ Erreur lors de l\'analyse SonarQube:', error);
      process.exit(1);
    }
    console.log('✅ Analyse SonarQube terminée avec succès!');
    console.log('📊 Consultez les résultats sur: http://localhost:9000/dashboard?id=ticketflow');
  }
);
