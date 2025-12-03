-- ==========================================
-- Script SQL de seed pour la base de données
-- ==========================================
-- Mot de passe pour tous les utilisateurs: Password123!@
-- Hash bcrypt (12 rounds): $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm

-- Nettoyer les données existantes (ordre important pour les contraintes FK)
DELETE FROM "Notification";
DELETE FROM "TicketHistory";
DELETE FROM "TicketMessage";
DELETE FROM "Article";
DELETE FROM "Ticket";
DELETE FROM "User";
DELETE FROM "SLA";
DELETE FROM "Category";

-- ==========================================
-- Catégories
-- ==========================================
INSERT INTO "Category" (id, name, description, "createdAt") VALUES
('cat-1', 'Technique', 'Problèmes techniques et bugs', NOW()),
('cat-2', 'Facturation', 'Questions de facturation et paiement', NOW()),
('cat-3', 'Commercial', 'Demandes commerciales et devis', NOW()),
('cat-4', 'Support Général', 'Questions générales et assistance', NOW()),
('cat-5', 'Fonctionnalités', 'Demandes de nouvelles fonctionnalités', NOW());

-- ==========================================
-- SLA
-- ==========================================
INSERT INTO "SLA" (id, name, priority, "responseTime", "resolutionTime", "escalationEnabled", "createdAt", "updatedAt") VALUES
('sla-1', 'SLA Critique', 'CRITIQUE', 30, 240, true, NOW(), NOW()),
('sla-2', 'SLA Haute', 'HAUTE', 60, 480, true, NOW(), NOW()),
('sla-3', 'SLA Moyenne', 'MOYENNE', 240, 1440, false, NOW(), NOW()),
('sla-4', 'SLA Basse', 'BASSE', 480, 2880, false, NOW(), NOW());

-- ==========================================
-- Utilisateurs
-- ==========================================
INSERT INTO "User" (id, email, name, password, role, avatar, "twoFactorEnabled", "hasCompletedTutorial", "createdAt", "updatedAt") VALUES
('user-1', 'admin@ticketflow.com', 'Sophie Martin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm', 'ADMIN', '/woman-admin-professional.jpg', true, false, NOW(), NOW()),
('user-2', 'manager@ticketflow.com', 'Pierre Dubois', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm', 'MANAGER', '/man-manager-professional.jpg', true, false, NOW(), NOW()),
('user-3', 'agent@ticketflow.com', 'Marie Leroy', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm', 'AGENT', '/woman-agent-support.jpg', false, false, NOW(), NOW()),
('user-4', 'agent2@ticketflow.com', 'Lucas Bernard', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm', 'AGENT', '/man-agent-support.jpg', false, false, NOW(), NOW()),
('user-5', 'client@example.com', 'Emma Petit', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm', 'DEMANDEUR', '/woman-client-user.jpg', false, false, NOW(), NOW()),
('user-6', 'client2@example.com', 'Thomas Moreau', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaEQIm', 'DEMANDEUR', '/man-client-user.jpg', false, false, NOW(), NOW());

-- ==========================================
-- Tickets
-- ==========================================
INSERT INTO "Ticket" (id, title, description, type, status, priority, "categoryId", "createdById", "assignedToId", "slaId", "dueDate", tags, "timeSpent", "createdAt", "updatedAt") VALUES
('TKT-001', 'Impossible de se connecter à l''application mobile', 'Depuis la dernière mise à jour, je n''arrive plus à me connecter à l''application mobile. Le message d''erreur indique ''Session expirée'' même après avoir réinitialisé mon mot de passe.', 'INCIDENT', 'EN_COURS', 'HAUTE', 'cat-1', 'user-5', 'user-3', 'sla-2', '2024-11-28', ARRAY['mobile', 'authentification', 'urgent'], 45, NOW(), NOW()),
('TKT-002', 'Demande de remboursement - Facture #2024-0892', 'Je souhaite demander un remboursement pour la facture #2024-0892. Le service n''a pas été utilisé pendant la période facturée suite à une erreur de configuration de notre côté.', 'DEMANDE', 'EN_ATTENTE', 'MOYENNE', 'cat-2', 'user-6', 'user-4', 'sla-3', '2024-11-30', ARRAY['facturation', 'remboursement'], 30, NOW(), NOW()),
('TKT-003', 'Erreur 500 sur la page de paiement', 'Une erreur 500 s''affiche lorsque j''essaie de valider mon paiement. J''ai essayé avec plusieurs navigateurs mais le problème persiste.', 'INCIDENT', 'OUVERT', 'CRITIQUE', 'cat-1', 'user-5', NULL, 'sla-1', '2024-11-26', ARRAY['paiement', 'erreur-500', 'critique'], 0, NOW(), NOW()),
('TKT-004', 'Demande de devis pour licence entreprise', 'Notre entreprise souhaite passer à une licence entreprise pour 50 utilisateurs. Pourriez-vous nous faire parvenir un devis personnalisé ?', 'DEMANDE', 'RESOLU', 'BASSE', 'cat-3', 'user-6', 'user-3', 'sla-4', NULL, ARRAY['commercial', 'devis', 'entreprise'], 120, NOW(), NOW()),
('TKT-005', 'Intégration API - Documentation manquante', 'La documentation de l''API v2 semble incomplète. Il manque les endpoints pour la gestion des webhooks. Pouvez-vous mettre à jour la documentation ?', 'DEMANDE', 'EN_COURS', 'MOYENNE', 'cat-5', 'user-5', 'user-4', 'sla-3', '2024-11-29', ARRAY['api', 'documentation', 'webhooks'], 90, NOW(), NOW()),
('TKT-006', 'Bug d''affichage sur tableau de bord', 'Les graphiques du tableau de bord ne s''affichent pas correctement sur Firefox. Le problème n''existe pas sur Chrome.', 'INCIDENT', 'FERME', 'BASSE', 'cat-1', 'user-6', 'user-3', 'sla-4', NULL, ARRAY['bug', 'firefox', 'dashboard'], 60, NOW(), NOW());

-- Mettre à jour les dates de résolution
UPDATE "Ticket" SET "resolvedAt" = '2024-11-23' WHERE id = 'TKT-004';
UPDATE "Ticket" SET "resolvedAt" = '2024-11-21', "closedAt" = '2024-11-22' WHERE id = 'TKT-006';

-- ==========================================
-- Messages de tickets
-- ==========================================
INSERT INTO "TicketMessage" (id, "ticketId", "senderId", content, type, "readBy", "createdAt") VALUES
('msg-1', 'TKT-001', 'user-5', 'J''ai aussi essayé de vider le cache de l''application mais ça ne fonctionne toujours pas.', 'PUBLIC', ARRAY['user-5', 'user-3'], NOW()),
('msg-2', 'TKT-001', 'user-3', 'Bonjour Emma, merci pour ces informations. Pouvez-vous me préciser la version de l''application que vous utilisez ? Vous pouvez la trouver dans Paramètres > À propos.', 'PUBLIC', ARRAY['user-5', 'user-3'], NOW()),
('msg-3', 'TKT-001', 'user-3', 'Note interne: Vérifier les logs serveur pour les tentatives de connexion de cet utilisateur.', 'INTERNE', ARRAY['user-3', 'user-2'], NOW()),
('msg-4', 'TKT-001', 'user-5', 'La version est 2.4.1. J''utilise un iPhone 14 Pro avec iOS 17.1.', 'PUBLIC', ARRAY['user-5', 'user-3'], NOW()),
('msg-5', 'TKT-001', 'user-3', 'Merci pour ces précisions. J''ai identifié un problème connu avec la version 2.4.1 sur iOS 17. Une mise à jour corrective (2.4.2) sera disponible d''ici demain. En attendant, je vous envoie un lien pour installer une version beta qui corrige le problème.', 'PUBLIC', ARRAY['user-3'], NOW());

-- ==========================================
-- Historique des tickets
-- ==========================================
INSERT INTO "TicketHistory" (id, "ticketId", "userId", action, "oldValue", "newValue", "createdAt") VALUES
('hist-1', 'TKT-001', 'user-5', 'Ticket créé', NULL, NULL, NOW()),
('hist-2', 'TKT-001', 'user-2', 'Ticket assigné', NULL, 'Marie Leroy', NOW()),
('hist-3', 'TKT-001', 'user-3', 'Statut modifié', 'Ouvert', 'En cours', NOW()),
('hist-4', 'TKT-001', 'user-3', 'Priorité modifiée', 'Moyenne', 'Haute', NOW());

-- ==========================================
-- Notifications
-- ==========================================
INSERT INTO "Notification" (id, "userId", type, title, message, "ticketId", read, "createdAt") VALUES
('notif-1', 'user-1', 'NOUVEAU_TICKET', 'Nouveau ticket critique', 'TKT-003: Erreur 500 sur la page de paiement', 'TKT-003', false, NOW()),
('notif-2', 'user-1', 'SLA_ALERTE', 'Alerte SLA', 'Le ticket TKT-003 approche de sa date limite de réponse', 'TKT-003', false, NOW()),
('notif-3', 'user-1', 'NOUVEAU_MESSAGE', 'Nouveau message', 'Emma Petit a répondu au ticket TKT-001', 'TKT-001', true, NOW()),
('notif-4', 'user-1', 'TICKET_ASSIGNE', 'Ticket assigné', 'TKT-002 a été assigné à Lucas Bernard', 'TKT-002', true, NOW());

-- ==========================================
-- Articles de la base de connaissances
-- ==========================================
INSERT INTO "Article" (id, title, content, "categoryId", "authorId", views, helpful, "notHelpful", "createdAt", "updatedAt") VALUES
('article-1', 'Comment réinitialiser son mot de passe', '# Comment réinitialiser son mot de passe

## Étape 1: Accéder à la page de connexion
Rendez-vous sur la page de connexion et cliquez sur "Mot de passe oublié".

## Étape 2: Entrer votre email
Saisissez l''adresse email associée à votre compte.

## Étape 3: Vérifier votre boîte mail
Un email contenant un lien de réinitialisation vous sera envoyé.

## Étape 4: Créer un nouveau mot de passe
Cliquez sur le lien et définissez un nouveau mot de passe sécurisé.', 'cat-4', 'user-1', 1250, 89, 5, NOW(), NOW()),

('article-2', 'Guide d''intégration API', '# Guide d''intégration API

## Introduction
Ce guide vous explique comment intégrer l''API TicketFlow dans votre application.

## Authentification
Toutes les requêtes doivent inclure un header Authorization avec votre clé API.

## Endpoints principaux
- GET /api/tickets - Liste des tickets
- POST /api/tickets - Créer un ticket
- PUT /api/tickets/:id - Modifier un ticket', 'cat-1', 'user-1', 890, 67, 3, NOW(), NOW()),

('article-3', 'FAQ - Questions fréquentes sur la facturation', '# FAQ - Facturation

## Comment obtenir une facture ?
Les factures sont automatiquement envoyées par email après chaque paiement.

## Comment modifier mes informations de facturation ?
Accédez à Paramètres > Facturation pour modifier vos informations.

## Quels moyens de paiement acceptez-vous ?
Nous acceptons les cartes Visa, Mastercard, et les virements bancaires.', 'cat-2', 'user-2', 2100, 156, 12, NOW(), NOW());

-- ==========================================
-- Résumé
-- ==========================================
-- ✅ 5 catégories
-- ✅ 4 SLA
-- ✅ 6 utilisateurs (mot de passe: Password123!@)
-- ✅ 6 tickets
-- ✅ 5 messages
-- ✅ 4 entrées d'historique
-- ✅ 4 notifications
-- ✅ 3 articles
