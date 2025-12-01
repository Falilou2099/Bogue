import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seed de la base de données...")

  // Hash du mot de passe pour les utilisateurs de test (12 caractères minimum)
  const hashedPassword = await bcrypt.hash("Password123!", 12)

  // Créer les catégories
  console.log("📁 Création des catégories...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-1" },
      update: {},
      create: {
        id: "cat-1",
        name: "Technique",
        description: "Problèmes techniques et bugs",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-2" },
      update: {},
      create: {
        id: "cat-2",
        name: "Facturation",
        description: "Questions de facturation et paiement",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-3" },
      update: {},
      create: {
        id: "cat-3",
        name: "Commercial",
        description: "Demandes commerciales et devis",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-4" },
      update: {},
      create: {
        id: "cat-4",
        name: "Support Général",
        description: "Questions générales et assistance",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-5" },
      update: {},
      create: {
        id: "cat-5",
        name: "Fonctionnalités",
        description: "Demandes de nouvelles fonctionnalités",
      },
    }),
  ])
  console.log(`✅ ${categories.length} catégories créées`)

  // Créer les SLA
  console.log("⏱️  Création des SLA...")
  const slas = await Promise.all([
    prisma.sLA.upsert({
      where: { id: "sla-1" },
      update: {},
      create: {
        id: "sla-1",
        name: "SLA Critique",
        priority: "CRITIQUE",
        responseTime: 30,
        resolutionTime: 240,
        escalationEnabled: true,
      },
    }),
    prisma.sLA.upsert({
      where: { id: "sla-2" },
      update: {},
      create: {
        id: "sla-2",
        name: "SLA Haute",
        priority: "HAUTE",
        responseTime: 60,
        resolutionTime: 480,
        escalationEnabled: true,
      },
    }),
    prisma.sLA.upsert({
      where: { id: "sla-3" },
      update: {},
      create: {
        id: "sla-3",
        name: "SLA Moyenne",
        priority: "MOYENNE",
        responseTime: 240,
        resolutionTime: 1440,
        escalationEnabled: false,
      },
    }),
    prisma.sLA.upsert({
      where: { id: "sla-4" },
      update: {},
      create: {
        id: "sla-4",
        name: "SLA Basse",
        priority: "BASSE",
        responseTime: 480,
        resolutionTime: 2880,
        escalationEnabled: false,
      },
    }),
  ])
  console.log(`✅ ${slas.length} SLA créés`)

  // Créer les utilisateurs
  console.log("👥 Création des utilisateurs...")
  const user1 = await prisma.user.upsert({
    where: { email: "admin@ticketflow.com" },
    update: {},
    create: {
      id: "user-1",
      email: "admin@ticketflow.com",
      name: "Sophie Martin",
      password: hashedPassword,
      role: "ADMIN",
      avatar: "/woman-admin-professional.jpg",
      twoFactorEnabled: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: "manager@ticketflow.com" },
    update: {},
    create: {
      id: "user-2",
      email: "manager@ticketflow.com",
      name: "Pierre Dubois",
      password: hashedPassword,
      role: "MANAGER",
      avatar: "/man-manager-professional.jpg",
      twoFactorEnabled: true,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: "agent@ticketflow.com" },
    update: {},
    create: {
      id: "user-3",
      email: "agent@ticketflow.com",
      name: "Marie Leroy",
      password: hashedPassword,
      role: "AGENT",
      avatar: "/woman-agent-support.jpg",
      twoFactorEnabled: false,
    },
  })

  const user4 = await prisma.user.upsert({
    where: { email: "agent2@ticketflow.com" },
    update: {},
    create: {
      id: "user-4",
      email: "agent2@ticketflow.com",
      name: "Lucas Bernard",
      password: hashedPassword,
      role: "AGENT",
      avatar: "/man-agent-support.jpg",
      twoFactorEnabled: false,
    },
  })

  const user5 = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      id: "user-5",
      email: "client@example.com",
      name: "Emma Petit",
      password: hashedPassword,
      role: "DEMANDEUR",
      avatar: "/woman-client-user.jpg",
      twoFactorEnabled: false,
    },
  })

  const user6 = await prisma.user.upsert({
    where: { email: "client2@example.com" },
    update: {},
    create: {
      id: "user-6",
      email: "client2@example.com",
      name: "Thomas Moreau",
      password: hashedPassword,
      role: "DEMANDEUR",
      avatar: "/man-client-user.jpg",
      twoFactorEnabled: false,
    },
  })

  console.log(`✅ 6 utilisateurs créés`)

  // Créer les tickets
  console.log("🎫 Création des tickets...")
  const tickets = await Promise.all([
    prisma.ticket.upsert({
      where: { id: "TKT-001" },
      update: {},
      create: {
        id: "TKT-001",
        title: "Impossible de se connecter à l'application mobile",
        description: "Depuis la dernière mise à jour, je n'arrive plus à me connecter à l'application mobile. Le message d'erreur indique 'Session expirée' même après avoir réinitialisé mon mot de passe.",
        type: "INCIDENT",
        status: "EN_COURS",
        priority: "HAUTE",
        categoryId: "cat-1",
        createdById: user5.id,
        assignedToId: user3.id,
        slaId: "sla-2",
        dueDate: new Date("2024-11-28"),
        tags: ["mobile", "authentification", "urgent"],
        timeSpent: 45,
      },
    }),
    prisma.ticket.upsert({
      where: { id: "TKT-002" },
      update: {},
      create: {
        id: "TKT-002",
        title: "Demande de remboursement - Facture #2024-0892",
        description: "Je souhaite demander un remboursement pour la facture #2024-0892. Le service n'a pas été utilisé pendant la période facturée suite à une erreur de configuration de notre côté.",
        type: "DEMANDE",
        status: "EN_ATTENTE",
        priority: "MOYENNE",
        categoryId: "cat-2",
        createdById: user6.id,
        assignedToId: user4.id,
        slaId: "sla-3",
        dueDate: new Date("2024-11-30"),
        tags: ["facturation", "remboursement"],
        timeSpent: 30,
      },
    }),
    prisma.ticket.upsert({
      where: { id: "TKT-003" },
      update: {},
      create: {
        id: "TKT-003",
        title: "Erreur 500 sur la page de paiement",
        description: "Une erreur 500 s'affiche lorsque j'essaie de valider mon paiement. J'ai essayé avec plusieurs navigateurs mais le problème persiste.",
        type: "INCIDENT",
        status: "OUVERT",
        priority: "CRITIQUE",
        categoryId: "cat-1",
        createdById: user5.id,
        slaId: "sla-1",
        dueDate: new Date("2024-11-26"),
        tags: ["paiement", "erreur-500", "critique"],
        timeSpent: 0,
      },
    }),
    prisma.ticket.upsert({
      where: { id: "TKT-004" },
      update: {},
      create: {
        id: "TKT-004",
        title: "Demande de devis pour licence entreprise",
        description: "Notre entreprise souhaite passer à une licence entreprise pour 50 utilisateurs. Pourriez-vous nous faire parvenir un devis personnalisé ?",
        type: "DEMANDE",
        status: "RESOLU",
        priority: "BASSE",
        categoryId: "cat-3",
        createdById: user6.id,
        assignedToId: user3.id,
        slaId: "sla-4",
        resolvedAt: new Date("2024-11-23"),
        tags: ["commercial", "devis", "entreprise"],
        timeSpent: 120,
      },
    }),
    prisma.ticket.upsert({
      where: { id: "TKT-005" },
      update: {},
      create: {
        id: "TKT-005",
        title: "Intégration API - Documentation manquante",
        description: "La documentation de l'API v2 semble incomplète. Il manque les endpoints pour la gestion des webhooks. Pouvez-vous mettre à jour la documentation ?",
        type: "DEMANDE",
        status: "EN_COURS",
        priority: "MOYENNE",
        categoryId: "cat-5",
        createdById: user5.id,
        assignedToId: user4.id,
        slaId: "sla-3",
        dueDate: new Date("2024-11-29"),
        tags: ["api", "documentation", "webhooks"],
        timeSpent: 90,
      },
    }),
    prisma.ticket.upsert({
      where: { id: "TKT-006" },
      update: {},
      create: {
        id: "TKT-006",
        title: "Bug d'affichage sur tableau de bord",
        description: "Les graphiques du tableau de bord ne s'affichent pas correctement sur Firefox. Le problème n'existe pas sur Chrome.",
        type: "INCIDENT",
        status: "FERME",
        priority: "BASSE",
        categoryId: "cat-1",
        createdById: user6.id,
        assignedToId: user3.id,
        slaId: "sla-4",
        resolvedAt: new Date("2024-11-21"),
        closedAt: new Date("2024-11-22"),
        tags: ["bug", "firefox", "dashboard"],
        timeSpent: 60,
      },
    }),
  ])
  console.log(`✅ ${tickets.length} tickets créés`)

  // Créer les messages de tickets
  console.log("💬 Création des messages...")
  const messages = await Promise.all([
    prisma.ticketMessage.create({
      data: {
        id: "msg-1",
        ticketId: "TKT-001",
        senderId: user5.id,
        content: "J'ai aussi essayé de vider le cache de l'application mais ça ne fonctionne toujours pas.",
        type: "PUBLIC",
        readBy: [user5.id, user3.id],
      },
    }),
    prisma.ticketMessage.create({
      data: {
        id: "msg-2",
        ticketId: "TKT-001",
        senderId: user3.id,
        content: "Bonjour Emma, merci pour ces informations. Pouvez-vous me préciser la version de l'application que vous utilisez ? Vous pouvez la trouver dans Paramètres > À propos.",
        type: "PUBLIC",
        readBy: [user5.id, user3.id],
      },
    }),
    prisma.ticketMessage.create({
      data: {
        id: "msg-3",
        ticketId: "TKT-001",
        senderId: user3.id,
        content: "Note interne: Vérifier les logs serveur pour les tentatives de connexion de cet utilisateur.",
        type: "INTERNE",
        readBy: [user3.id, user2.id],
      },
    }),
    prisma.ticketMessage.create({
      data: {
        id: "msg-4",
        ticketId: "TKT-001",
        senderId: user5.id,
        content: "La version est 2.4.1. J'utilise un iPhone 14 Pro avec iOS 17.1.",
        type: "PUBLIC",
        readBy: [user5.id, user3.id],
      },
    }),
    prisma.ticketMessage.create({
      data: {
        id: "msg-5",
        ticketId: "TKT-001",
        senderId: user3.id,
        content: "Merci pour ces précisions. J'ai identifié un problème connu avec la version 2.4.1 sur iOS 17. Une mise à jour corrective (2.4.2) sera disponible d'ici demain. En attendant, je vous envoie un lien pour installer une version beta qui corrige le problème.",
        type: "PUBLIC",
        readBy: [user3.id],
      },
    }),
  ])
  console.log(`✅ ${messages.length} messages créés`)

  // Créer l'historique des tickets
  console.log("📜 Création de l'historique...")
  const history = await Promise.all([
    prisma.ticketHistory.create({
      data: {
        id: "hist-1",
        ticketId: "TKT-001",
        userId: user5.id,
        action: "Ticket créé",
      },
    }),
    prisma.ticketHistory.create({
      data: {
        id: "hist-2",
        ticketId: "TKT-001",
        userId: user2.id,
        action: "Ticket assigné",
        newValue: "Marie Leroy",
      },
    }),
    prisma.ticketHistory.create({
      data: {
        id: "hist-3",
        ticketId: "TKT-001",
        userId: user3.id,
        action: "Statut modifié",
        oldValue: "Ouvert",
        newValue: "En cours",
      },
    }),
    prisma.ticketHistory.create({
      data: {
        id: "hist-4",
        ticketId: "TKT-001",
        userId: user3.id,
        action: "Priorité modifiée",
        oldValue: "Moyenne",
        newValue: "Haute",
      },
    }),
  ])
  console.log(`✅ ${history.length} entrées d'historique créées`)

  // Créer les notifications
  console.log("🔔 Création des notifications...")
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        id: "notif-1",
        userId: user1.id,
        type: "NOUVEAU_TICKET",
        title: "Nouveau ticket critique",
        message: "TKT-003: Erreur 500 sur la page de paiement",
        ticketId: "TKT-003",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        id: "notif-2",
        userId: user1.id,
        type: "SLA_ALERTE",
        title: "Alerte SLA",
        message: "Le ticket TKT-003 approche de sa date limite de réponse",
        ticketId: "TKT-003",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        id: "notif-3",
        userId: user1.id,
        type: "NOUVEAU_MESSAGE",
        title: "Nouveau message",
        message: "Emma Petit a répondu au ticket TKT-001",
        ticketId: "TKT-001",
        read: true,
      },
    }),
    prisma.notification.create({
      data: {
        id: "notif-4",
        userId: user1.id,
        type: "TICKET_ASSIGNE",
        title: "Ticket assigné",
        message: "TKT-002 a été assigné à Lucas Bernard",
        ticketId: "TKT-002",
        read: true,
      },
    }),
  ])
  console.log(`✅ ${notifications.length} notifications créées`)

  // Créer les articles de la base de connaissances
  console.log("📚 Création des articles...")
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        id: "article-1",
        title: "Comment réinitialiser son mot de passe",
        content: `# Comment réinitialiser son mot de passe

## Étape 1: Accéder à la page de connexion
Rendez-vous sur la page de connexion et cliquez sur "Mot de passe oublié".

## Étape 2: Entrer votre email
Saisissez l'adresse email associée à votre compte.

## Étape 3: Vérifier votre boîte mail
Un email contenant un lien de réinitialisation vous sera envoyé.

## Étape 4: Créer un nouveau mot de passe
Cliquez sur le lien et définissez un nouveau mot de passe sécurisé.`,
        categoryId: "cat-4",
        authorId: user1.id,
        views: 1250,
        helpful: 89,
        notHelpful: 5,
      },
    }),
    prisma.article.create({
      data: {
        id: "article-2",
        title: "Guide d'intégration API",
        content: `# Guide d'intégration API

## Introduction
Ce guide vous explique comment intégrer l'API TicketFlow dans votre application.

## Authentification
Toutes les requêtes doivent inclure un header Authorization avec votre clé API.

## Endpoints principaux
- GET /api/tickets - Liste des tickets
- POST /api/tickets - Créer un ticket
- PUT /api/tickets/:id - Modifier un ticket`,
        categoryId: "cat-1",
        authorId: user1.id,
        views: 890,
        helpful: 67,
        notHelpful: 3,
      },
    }),
    prisma.article.create({
      data: {
        id: "article-3",
        title: "FAQ - Questions fréquentes sur la facturation",
        content: `# FAQ - Facturation

## Comment obtenir une facture ?
Les factures sont automatiquement envoyées par email après chaque paiement.

## Comment modifier mes informations de facturation ?
Accédez à Paramètres > Facturation pour modifier vos informations.

## Quels moyens de paiement acceptez-vous ?
Nous acceptons les cartes Visa, Mastercard, et les virements bancaires.`,
        categoryId: "cat-2",
        authorId: user2.id,
        views: 2100,
        helpful: 156,
        notHelpful: 12,
      },
    }),
  ])
  console.log(`✅ ${articles.length} articles créés`)

  console.log("\n🎉 Seed terminé avec succès!")
  console.log("\n📊 Résumé des données créées:")
  console.log(`   - ${categories.length} catégories`)
  console.log(`   - ${slas.length} SLA`)
  console.log(`   - 6 utilisateurs`)
  console.log(`   - ${tickets.length} tickets`)
  console.log(`   - ${messages.length} messages`)
  console.log(`   - ${history.length} entrées d'historique`)
  console.log(`   - ${notifications.length} notifications`)
  console.log(`   - ${articles.length} articles`)
  console.log("\n📝 Utilisateurs de test:")
  console.log("   - admin@ticketflow.com (Admin)")
  console.log("   - manager@ticketflow.com (Manager)")
  console.log("   - agent@ticketflow.com (Agent)")
  console.log("   - agent2@ticketflow.com (Agent)")
  console.log("   - client@example.com (Demandeur)")
  console.log("   - client2@example.com (Demandeur)")
  console.log("\n🔑 Mot de passe pour tous: Password123!")
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
