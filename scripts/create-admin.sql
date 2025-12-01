-- ==========================================
-- Template de création d'un compte Admin
-- ==========================================
-- Ce script est un TEMPLATE pour créer un compte administrateur
-- 
-- ⚠️ SÉCURITÉ: Ne commitez JAMAIS ce fichier avec un mot de passe réel
--
-- Utilisation recommandée:
-- 1. Utilisez le script Node.js: node scripts/create-admin.js
--    (Génère automatiquement un hash bcrypt sécurisé)
--
-- 2. OU générez un hash manuellement:
--    node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('VotreMotDePasse', 12).then(console.log)"
--
-- 3. Remplacez <BCRYPT_HASH_HERE> ci-dessous par le hash généré
-- 4. Exécutez ce script SQL dans votre base de données
-- ==========================================

-- Insérer l'utilisateur admin
-- REMPLACEZ <BCRYPT_HASH_HERE> par un hash bcrypt généré
INSERT INTO users (id, name, email, password, role, avatar, created_at, updated_at, "hasCompletedTutorial")
VALUES (
  'admin-default',
  'Administrateur',
  'admin@ticketflow.com',
  '<BCRYPT_HASH_HERE>',
  'ADMIN',
  '/avatars/admin.png',
  NOW(),
  NOW(),
  true
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  updated_at = NOW();

-- Vérifier que l'admin a été créé
SELECT id, name, email, role, created_at 
FROM users 
WHERE email = 'admin@ticketflow.com';
