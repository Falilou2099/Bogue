import type {
  User,
  Ticket,
  TicketMessage,
  Notification,
  Category,
  SLA,
  Article,
  DashboardStats,
  AgentPerformance,
  TicketHistory,
} from "./types"

// ==========================================
// Utilisateurs Mock
// ==========================================

export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "admin@ticketflow.com",
    name: "Sophie Martin",
    role: "admin",
    avatar: "/woman-admin-professional.jpg",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    twoFactorEnabled: true,
  },
  {
    id: "user-2",
    email: "manager@ticketflow.com",
    name: "Pierre Dubois",
    role: "manager",
    avatar: "/man-manager-professional.jpg",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    twoFactorEnabled: true,
  },
  {
    id: "user-3",
    email: "agent@ticketflow.com",
    name: "Marie Leroy",
    role: "agent",
    avatar: "/woman-agent-support.jpg",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
    twoFactorEnabled: false,
  },
  {
    id: "user-4",
    email: "agent2@ticketflow.com",
    name: "Lucas Bernard",
    role: "agent",
    avatar: "/man-agent-support.jpg",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
    twoFactorEnabled: false,
  },
  {
    id: "user-5",
    email: "client@example.com",
    name: "Emma Petit",
    role: "demandeur",
    avatar: "/woman-client-user.jpg",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    twoFactorEnabled: false,
  },
  {
    id: "user-6",
    email: "client2@example.com",
    name: "Thomas Moreau",
    role: "demandeur",
    avatar: "/man-client-user.jpg",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15"),
    twoFactorEnabled: false,
  },
]

// ==========================================
// Catégories Mock
// ==========================================

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Technique",
    description: "Problèmes techniques et bugs",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "cat-2",
    name: "Facturation",
    description: "Questions de facturation et paiement",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "cat-3",
    name: "Commercial",
    description: "Demandes commerciales et devis",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "cat-4",
    name: "Support Général",
    description: "Questions générales et assistance",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "cat-5",
    name: "Fonctionnalités",
    description: "Demandes de nouvelles fonctionnalités",
    createdAt: new Date("2024-01-01"),
  },
]

// ==========================================
// SLA Mock
// ==========================================

export const mockSLAs: SLA[] = [
  {
    id: "sla-1",
    name: "SLA Critique",
    priority: "critique",
    responseTime: 30,
    resolutionTime: 240,
    escalationEnabled: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "sla-2",
    name: "SLA Haute",
    priority: "haute",
    responseTime: 60,
    resolutionTime: 480,
    escalationEnabled: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "sla-3",
    name: "SLA Moyenne",
    priority: "moyenne",
    responseTime: 240,
    resolutionTime: 1440,
    escalationEnabled: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "sla-4",
    name: "SLA Basse",
    priority: "basse",
    responseTime: 480,
    resolutionTime: 2880,
    escalationEnabled: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

// ==========================================
// Tickets Mock
// ==========================================

export const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Impossible de se connecter à l'application mobile",
    description:
      "Depuis la dernière mise à jour, je n'arrive plus à me connecter à l'application mobile. Le message d'erreur indique 'Session expirée' même après avoir réinitialisé mon mot de passe.",
    type: "incident",
    status: "en_cours",
    priority: "haute",
    categoryId: "cat-1",
    category: mockCategories[0],
    createdById: "user-5",
    createdBy: mockUsers[4],
    assignedToId: "user-3",
    assignedTo: mockUsers[2],
    slaId: "sla-2",
    sla: mockSLAs[1],
    dueDate: new Date("2024-11-28"),
    createdAt: new Date("2024-11-25T10:30:00"),
    updatedAt: new Date("2024-11-26T14:20:00"),
    attachments: [],
    tags: ["mobile", "authentification", "urgent"],
    timeSpent: 45,
  },
  {
    id: "TKT-002",
    title: "Demande de remboursement - Facture #2024-0892",
    description:
      "Je souhaite demander un remboursement pour la facture #2024-0892. Le service n'a pas été utilisé pendant la période facturée suite à une erreur de configuration de notre côté.",
    type: "demande",
    status: "en_attente",
    priority: "moyenne",
    categoryId: "cat-2",
    category: mockCategories[1],
    createdById: "user-6",
    createdBy: mockUsers[5],
    assignedToId: "user-4",
    assignedTo: mockUsers[3],
    slaId: "sla-3",
    sla: mockSLAs[2],
    dueDate: new Date("2024-11-30"),
    createdAt: new Date("2024-11-24T09:15:00"),
    updatedAt: new Date("2024-11-25T11:00:00"),
    attachments: [],
    tags: ["facturation", "remboursement"],
    timeSpent: 30,
  },
  {
    id: "TKT-003",
    title: "Erreur 500 sur la page de paiement",
    description:
      "Une erreur 500 s'affiche lorsque j'essaie de valider mon paiement. J'ai essayé avec plusieurs navigateurs mais le problème persiste.",
    type: "incident",
    status: "ouvert",
    priority: "critique",
    categoryId: "cat-1",
    category: mockCategories[0],
    createdById: "user-5",
    createdBy: mockUsers[4],
    slaId: "sla-1",
    sla: mockSLAs[0],
    dueDate: new Date("2024-11-26"),
    createdAt: new Date("2024-11-26T08:00:00"),
    updatedAt: new Date("2024-11-26T08:00:00"),
    attachments: [],
    tags: ["paiement", "erreur-500", "critique"],
    timeSpent: 0,
  },
  {
    id: "TKT-004",
    title: "Demande de devis pour licence entreprise",
    description:
      "Notre entreprise souhaite passer à une licence entreprise pour 50 utilisateurs. Pourriez-vous nous faire parvenir un devis personnalisé ?",
    type: "demande",
    status: "resolu",
    priority: "basse",
    categoryId: "cat-3",
    category: mockCategories[2],
    createdById: "user-6",
    createdBy: mockUsers[5],
    assignedToId: "user-3",
    assignedTo: mockUsers[2],
    slaId: "sla-4",
    sla: mockSLAs[3],
    resolvedAt: new Date("2024-11-23"),
    createdAt: new Date("2024-11-20T14:30:00"),
    updatedAt: new Date("2024-11-23T16:45:00"),
    attachments: [],
    tags: ["commercial", "devis", "entreprise"],
    timeSpent: 120,
  },
  {
    id: "TKT-005",
    title: "Intégration API - Documentation manquante",
    description:
      "La documentation de l'API v2 semble incomplète. Il manque les endpoints pour la gestion des webhooks. Pouvez-vous mettre à jour la documentation ?",
    type: "demande",
    status: "en_cours",
    priority: "moyenne",
    categoryId: "cat-5",
    category: mockCategories[4],
    createdById: "user-5",
    createdBy: mockUsers[4],
    assignedToId: "user-4",
    assignedTo: mockUsers[3],
    slaId: "sla-3",
    sla: mockSLAs[2],
    dueDate: new Date("2024-11-29"),
    createdAt: new Date("2024-11-22T11:00:00"),
    updatedAt: new Date("2024-11-25T09:30:00"),
    attachments: [],
    tags: ["api", "documentation", "webhooks"],
    timeSpent: 90,
  },
  {
    id: "TKT-006",
    title: "Bug d'affichage sur tableau de bord",
    description:
      "Les graphiques du tableau de bord ne s'affichent pas correctement sur Firefox. Le problème n'existe pas sur Chrome.",
    type: "incident",
    status: "ferme",
    priority: "basse",
    categoryId: "cat-1",
    category: mockCategories[0],
    createdById: "user-6",
    createdBy: mockUsers[5],
    assignedToId: "user-3",
    assignedTo: mockUsers[2],
    slaId: "sla-4",
    sla: mockSLAs[3],
    resolvedAt: new Date("2024-11-21"),
    closedAt: new Date("2024-11-22"),
    createdAt: new Date("2024-11-18T16:00:00"),
    updatedAt: new Date("2024-11-22T10:00:00"),
    attachments: [],
    tags: ["bug", "firefox", "dashboard"],
    timeSpent: 60,
  },
]

// ==========================================
// Messages de tickets Mock
// ==========================================

export const mockTicketMessages: TicketMessage[] = [
  {
    id: "msg-1",
    ticketId: "TKT-001",
    senderId: "user-5",
    sender: mockUsers[4],
    content: "J'ai aussi essayé de vider le cache de l'application mais ça ne fonctionne toujours pas.",
    type: "public",
    attachments: [],
    readBy: ["user-5", "user-3"],
    createdAt: new Date("2024-11-25T11:00:00"),
  },
  {
    id: "msg-2",
    ticketId: "TKT-001",
    senderId: "user-3",
    sender: mockUsers[2],
    content:
      "Bonjour Emma, merci pour ces informations. Pouvez-vous me préciser la version de l'application que vous utilisez ? Vous pouvez la trouver dans Paramètres > À propos.",
    type: "public",
    attachments: [],
    readBy: ["user-5", "user-3"],
    createdAt: new Date("2024-11-25T14:30:00"),
  },
  {
    id: "msg-3",
    ticketId: "TKT-001",
    senderId: "user-3",
    sender: mockUsers[2],
    content: "Note interne: Vérifier les logs serveur pour les tentatives de connexion de cet utilisateur.",
    type: "interne",
    attachments: [],
    readBy: ["user-3", "user-2"],
    createdAt: new Date("2024-11-25T14:35:00"),
  },
  {
    id: "msg-4",
    ticketId: "TKT-001",
    senderId: "user-5",
    sender: mockUsers[4],
    content: "La version est 2.4.1. J'utilise un iPhone 14 Pro avec iOS 17.1.",
    type: "public",
    attachments: [],
    readBy: ["user-5", "user-3"],
    createdAt: new Date("2024-11-26T09:15:00"),
  },
  {
    id: "msg-5",
    ticketId: "TKT-001",
    senderId: "user-3",
    sender: mockUsers[2],
    content:
      "Merci pour ces précisions. J'ai identifié un problème connu avec la version 2.4.1 sur iOS 17. Une mise à jour corrective (2.4.2) sera disponible d'ici demain. En attendant, je vous envoie un lien pour installer une version beta qui corrige le problème.",
    type: "public",
    attachments: [],
    readBy: ["user-3"],
    createdAt: new Date("2024-11-26T14:20:00"),
  },
]

// ==========================================
// Historique des tickets Mock
// ==========================================

export const mockTicketHistory: TicketHistory[] = [
  {
    id: "hist-1",
    ticketId: "TKT-001",
    userId: "user-5",
    user: mockUsers[4],
    action: "Ticket créé",
    createdAt: new Date("2024-11-25T10:30:00"),
  },
  {
    id: "hist-2",
    ticketId: "TKT-001",
    userId: "user-2",
    user: mockUsers[1],
    action: "Ticket assigné",
    newValue: "Marie Leroy",
    createdAt: new Date("2024-11-25T10:45:00"),
  },
  {
    id: "hist-3",
    ticketId: "TKT-001",
    userId: "user-3",
    user: mockUsers[2],
    action: "Statut modifié",
    oldValue: "Ouvert",
    newValue: "En cours",
    createdAt: new Date("2024-11-25T14:30:00"),
  },
  {
    id: "hist-4",
    ticketId: "TKT-001",
    userId: "user-3",
    user: mockUsers[2],
    action: "Priorité modifiée",
    oldValue: "Moyenne",
    newValue: "Haute",
    createdAt: new Date("2024-11-26T14:20:00"),
  },
]

// ==========================================
// Notifications Mock
// ==========================================

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "nouveau_ticket",
    title: "Nouveau ticket critique",
    message: "TKT-003: Erreur 500 sur la page de paiement",
    ticketId: "TKT-003",
    read: false,
    createdAt: new Date("2024-11-26T08:00:00"),
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "sla_alerte",
    title: "Alerte SLA",
    message: "Le ticket TKT-003 approche de sa date limite de réponse",
    ticketId: "TKT-003",
    read: false,
    createdAt: new Date("2024-11-26T08:30:00"),
  },
  {
    id: "notif-3",
    userId: "user-1",
    type: "nouveau_message",
    title: "Nouveau message",
    message: "Emma Petit a répondu au ticket TKT-001",
    ticketId: "TKT-001",
    read: true,
    createdAt: new Date("2024-11-26T09:15:00"),
  },
  {
    id: "notif-4",
    userId: "user-1",
    type: "ticket_assigne",
    title: "Ticket assigné",
    message: "TKT-002 a été assigné à Lucas Bernard",
    ticketId: "TKT-002",
    read: true,
    createdAt: new Date("2024-11-25T11:00:00"),
  },
]

// ==========================================
// Statistiques Dashboard Mock
// ==========================================

export const mockDashboardStats: DashboardStats = {
  ticketsOuverts: 12,
  ticketsEnCours: 8,
  ticketsResolus: 45,
  ticketsFermes: 120,
  tempsResolutionMoyen: 4.2,
  tauxSlaRespect: 94.5,
}

export const mockAgentPerformance: AgentPerformance[] = [
  {
    agentId: "user-3",
    agent: mockUsers[2],
    ticketsAssignes: 15,
    ticketsResolus: 12,
    tempsResolutionMoyen: 3.8,
    tauxSatisfaction: 96,
  },
  {
    agentId: "user-4",
    agent: mockUsers[3],
    ticketsAssignes: 18,
    ticketsResolus: 14,
    tempsResolutionMoyen: 4.5,
    tauxSatisfaction: 92,
  },
]

// ==========================================
// Articles Base de connaissances Mock
// ==========================================

export const mockArticles: Article[] = [
  {
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
    category: mockCategories[3],
    authorId: "user-1",
    author: mockUsers[0],
    views: 1250,
    helpful: 89,
    notHelpful: 5,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-20"),
  },
  {
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
    category: mockCategories[0],
    authorId: "user-1",
    author: mockUsers[0],
    views: 890,
    helpful: 67,
    notHelpful: 3,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-08-15"),
  },
  {
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
    category: mockCategories[1],
    authorId: "user-2",
    author: mockUsers[1],
    views: 2100,
    helpful: 156,
    notHelpful: 12,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-09-10"),
  },
]

// ==========================================
// Données de graphiques Mock
// ==========================================

export const mockChartData = {
  ticketsParJour: [
    { date: "Lun", ouverts: 12, resolus: 8 },
    { date: "Mar", ouverts: 15, resolus: 12 },
    { date: "Mer", ouverts: 8, resolus: 10 },
    { date: "Jeu", ouverts: 18, resolus: 15 },
    { date: "Ven", ouverts: 14, resolus: 11 },
    { date: "Sam", ouverts: 5, resolus: 6 },
    { date: "Dim", ouverts: 3, resolus: 4 },
  ],
  ticketsParCategorie: [
    { name: "Technique", value: 45, fill: "var(--chart-1)" },
    { name: "Facturation", value: 25, fill: "var(--chart-2)" },
    { name: "Commercial", value: 15, fill: "var(--chart-3)" },
    { name: "Support", value: 10, fill: "var(--chart-4)" },
    { name: "Autres", value: 5, fill: "var(--chart-5)" },
  ],
  ticketsParPriorite: [
    { name: "Basse", value: 30, fill: "var(--chart-1)" },
    { name: "Moyenne", value: 40, fill: "var(--chart-3)" },
    { name: "Haute", value: 20, fill: "var(--chart-4)" },
    { name: "Critique", value: 10, fill: "var(--destructive)" },
  ],
  performanceEquipe: [
    { mois: "Jan", tickets: 120, sla: 92 },
    { mois: "Fév", tickets: 135, sla: 94 },
    { mois: "Mar", tickets: 148, sla: 91 },
    { mois: "Avr", tickets: 160, sla: 95 },
    { mois: "Mai", tickets: 142, sla: 93 },
    { mois: "Jun", tickets: 155, sla: 96 },
  ],
}
