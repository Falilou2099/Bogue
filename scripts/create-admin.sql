-- ==========================================
-- Script de création d'un compte Admin
-- ==========================================
-- Ce script crée un compte administrateur par défaut
-- À exécuter après l'installation du projet
--
-- IMPORTANT: Changez le mot de passe après la première connexion !
--
-- Utilisation:
-- 1. Connectez-vous à votre base de données Neon
-- 2. Exécutez ce script SQL
-- 3. Connectez-vous avec: admin@ticketflow.com / AdminPassword123!
-- 4. Changez immédiatement le mot de passe
-- ==========================================

-- Insérer l'utilisateur admin
-- Mot de passe: AdminPassword123! (haché avec bcrypt, 12 rounds)
INSERT INTO users (id, name, email, password, role, avatar, created_at, updated_at)
VALUES (
  'admin-default',
  'Administrateur',
  'admin@ticketflow.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvjC3C',
  'ADMIN',
  '/avatars/admin.png',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Vérifier que l'admin a été créé
SELECT id, name, email, role, created_at 
FROM users 
WHERE email = 'admin@ticketflow.com';
