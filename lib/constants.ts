import type { TicketStatus, TicketPriority, TicketType, UserRole } from "./types"

// Labels pour les statuts
export const STATUS_LABELS: Record<TicketStatus, string> = {
  ouvert: "Ouvert",
  en_cours: "En cours",
  en_attente: "En attente",
  resolu: "Résolu",
  ferme: "Fermé",
}

// Couleurs pour les statuts (classes Tailwind)
export const STATUS_COLORS: Record<TicketStatus, string> = {
  ouvert: "bg-green-500/10 text-green-500 border-green-500/20",
  en_cours: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  en_attente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolu: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ferme: "bg-muted text-muted-foreground border-muted",
}

// Labels pour les priorités
export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
}

// Couleurs pour les priorités (classes Tailwind)
export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  basse: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  moyenne: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  haute: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critique: "bg-red-500/10 text-red-500 border-red-500/20",
}

// Labels pour les types de tickets
export const TYPE_LABELS: Record<TicketType, string> = {
  incident: "Incident",
  demande: "Demande",
  changement: "Changement",
}

// Labels pour les rôles
export const ROLE_LABELS: Record<UserRole, string> = {
  demandeur: "Demandeur",
  agent: "Agent",
  manager: "Manager",
  admin: "Administrateur",
}

// Permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  demandeur: ["ticket:create", "ticket:view_own", "chat:send_public", "chat:view_own"],
  agent: [
    "ticket:create",
    "ticket:view_assigned",
    "ticket:edit_assigned",
    "ticket:assign",
    "chat:send_public",
    "chat:send_internal",
    "chat:view_all",
    "kb:view",
  ],
  manager: [
    "ticket:create",
    "ticket:view_all",
    "ticket:edit_all",
    "ticket:assign",
    "chat:view_all",
    "chat:send_internal",
    "dashboard:view_team",
    "reports:view",
    "kb:view",
  ],
  admin: [
    "ticket:create",
    "ticket:view_all",
    "ticket:edit_all",
    "ticket:delete",
    "ticket:assign",
    "chat:view_all",
    "chat:send_internal",
    "dashboard:view_all",
    "reports:view",
    "reports:export",
    "users:manage",
    "roles:manage",
    "categories:manage",
    "sla:manage",
    "kb:manage",
    "audit:view",
  ],
}

// Types de notifications
export const NOTIFICATION_TYPES = {
  nouveau_ticket: {
    label: "Nouveau ticket",
    icon: "Plus",
  },
  ticket_assigne: {
    label: "Ticket assigné",
    icon: "UserPlus",
  },
  changement_statut: {
    label: "Changement de statut",
    icon: "RefreshCw",
  },
  nouveau_message: {
    label: "Nouveau message",
    icon: "MessageSquare",
  },
  ticket_ferme: {
    label: "Ticket fermé",
    icon: "CheckCircle",
  },
  sla_alerte: {
    label: "Alerte SLA",
    icon: "AlertTriangle",
  },
} as const

// Limites de pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// Microservices endpoints (pour référence)
export const MICROSERVICES = {
  users: "/api/users",
  tickets: "/api/tickets",
  chat: "/api/chat",
  notifications: "/api/notifications",
  analytics: "/api/analytics",
  files: "/api/files",
} as const
