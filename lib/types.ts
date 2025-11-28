// ==========================================
// Types de base pour TicketFlow
// ==========================================

// Rôles utilisateurs
export type UserRole = "demandeur" | "agent" | "manager" | "admin"

// Statuts des tickets (conformes au schéma Prisma)
export type TicketStatus = "OUVERT" | "EN_COURS" | "EN_ATTENTE" | "RESOLU" | "FERME"

// Priorités des tickets (conformes au schéma Prisma)
export type TicketPriority = "BASSE" | "MOYENNE" | "HAUTE" | "CRITIQUE"

// Types de tickets (conformes au schéma Prisma)
export type TicketType = "INCIDENT" | "DEMANDE" | "CHANGEMENT"

// ==========================================
// Interfaces Utilisateur
// ==========================================

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
  twoFactorEnabled: boolean
}

export interface UserSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

// ==========================================
// Interfaces Ticket
// ==========================================

export interface Ticket {
  id: string
  title: string
  description: string
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  categoryId: string
  category?: Category
  createdById: string
  createdBy?: User
  assignedToId?: string
  assignedTo?: User
  slaId?: string
  sla?: SLA
  dueDate?: Date
  resolvedAt?: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
  attachments: Attachment[]
  tags: string[]
  timeSpent: number // en minutes
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  sender?: User
  content: string
  type: "public" | "interne"
  attachments: Attachment[]
  readBy: string[]
  createdAt: Date
}

export interface TicketHistory {
  id: string
  ticketId: string
  userId: string
  user?: User
  action: string
  oldValue?: string
  newValue?: string
  createdAt: Date
}

// ==========================================
// Interfaces SLA & Catégories
// ==========================================

export interface SLA {
  id: string
  name: string
  priority: TicketPriority
  responseTime: number // en minutes
  resolutionTime: number // en minutes
  escalationEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  defaultSlaId?: string
  defaultSla?: SLA
  createdAt: Date
}

// ==========================================
// Interfaces Pièces jointes
// ==========================================

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  uploadedById: string
  createdAt: Date
}

// ==========================================
// Interfaces Notifications
// ==========================================

export type NotificationType =
  | "nouveau_ticket"
  | "ticket_assigne"
  | "changement_statut"
  | "nouveau_message"
  | "ticket_ferme"
  | "sla_alerte"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  ticketId?: string
  read: boolean
  createdAt: Date
}

// ==========================================
// Interfaces Dashboard & Stats
// ==========================================

export interface DashboardStats {
  ticketsOuverts: number
  ticketsEnCours: number
  ticketsResolus: number
  ticketsFermes: number
  tempsResolutionMoyen: number
  tauxSlaRespect: number
}

export interface AgentPerformance {
  agentId: string
  agent?: User
  ticketsAssignes: number
  ticketsResolus: number
  tempsResolutionMoyen: number
  tauxSatisfaction: number
}

// ==========================================
// Interfaces Base de connaissances
// ==========================================

export interface Article {
  id: string
  title: string
  content: string
  categoryId: string
  category?: Category
  authorId: string
  author?: User
  views: number
  helpful: number
  notHelpful: number
  createdAt: Date
  updatedAt: Date
}


// ==========================================
// Interfaces API Response
// ==========================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ==========================================
// Interfaces Filtres
// ==========================================

export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  type?: TicketType[]
  categoryId?: string
  assignedToId?: string
  createdById?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}
