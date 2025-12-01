import type { UserRole } from "./types"

/**
 * Système de permissions basé sur les rôles (RBAC)
 * 
 * Règles:
 * - CLIENT (demandeur): Accès uniquement à dashboard, tickets (leurs propres), knowledge-base
 * - AGENT: Accès à toutes les pages en lecture seule, sauf tickets (CRUD complet)
 * - MANAGER: Accès complet à tout
 * - ADMIN: Accès complet à tout
 */

export type Permission =
  // Permissions tickets
  | "tickets:view_own"      // Voir ses propres tickets
  | "tickets:view_all"      // Voir tous les tickets
  | "tickets:create"        // Créer des tickets
  | "tickets:update"        // Modifier des tickets
  | "tickets:delete"        // Supprimer des tickets
  | "tickets:assign"        // Assigner des tickets
  
  // Permissions dashboard
  | "dashboard:view"        // Voir le dashboard
  | "dashboard:sla"         // Voir les performances SLA
  | "dashboard:agents"      // Voir les performances des agents
  
  // Permissions base de connaissances
  | "kb:view"              // Voir la base de connaissances
  | "kb:create"            // Créer des articles
  | "kb:update"            // Modifier des articles
  | "kb:delete"            // Supprimer des articles
  
  // Permissions utilisateurs
  | "users:view"           // Voir les utilisateurs
  | "users:create"         // Créer des utilisateurs
  | "users:update"         // Modifier des utilisateurs
  | "users:delete"         // Supprimer des utilisateurs
  
  // Permissions catégories
  | "categories:view"      // Voir les catégories
  | "categories:create"    // Créer des catégories
  | "categories:update"    // Modifier des catégories
  | "categories:delete"    // Supprimer des catégories
  
  // Permissions SLA
  | "sla:view"            // Voir les SLA
  | "sla:create"          // Créer des SLA
  | "sla:update"          // Modifier des SLA
  | "sla:delete"          // Supprimer des SLA
  
  // Permissions analytics
  | "analytics:view"      // Voir les analytics
  
  // Permissions audit
  | "audit:view"          // Voir les logs d'audit

/**
 * Matrice des permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // CLIENT (demandeur): Accès limité
  demandeur: [
    "tickets:view_own",
    "tickets:create",
    "dashboard:view",
    "kb:view",
  ],
  
  // AGENT: Lecture seule sauf tickets
  agent: [
    "tickets:view_all",
    "tickets:create",
    "tickets:update",
    "tickets:delete",
    "tickets:assign",
    "dashboard:view",
    "kb:view",
    "categories:view",
    "sla:view",
    "users:view",
    "analytics:view",
  ],
  
  // MANAGER: Accès complet
  manager: [
    "tickets:view_all",
    "tickets:create",
    "tickets:update",
    "tickets:delete",
    "tickets:assign",
    "dashboard:view",
    "dashboard:sla",
    "dashboard:agents",
    "kb:view",
    "kb:create",
    "kb:update",
    "kb:delete",
    "categories:view",
    "categories:create",
    "categories:update",
    "categories:delete",
    "sla:view",
    "sla:create",
    "sla:update",
    "sla:delete",
    "users:view",
    "users:create",
    "users:update",
    "users:delete",
    "analytics:view",
    "audit:view",
  ],
  
  // ADMIN: Accès complet
  admin: [
    "tickets:view_all",
    "tickets:create",
    "tickets:update",
    "tickets:delete",
    "tickets:assign",
    "dashboard:view",
    "dashboard:sla",
    "dashboard:agents",
    "kb:view",
    "kb:create",
    "kb:update",
    "kb:delete",
    "categories:view",
    "categories:create",
    "categories:update",
    "categories:delete",
    "sla:view",
    "sla:create",
    "sla:update",
    "sla:delete",
    "users:view",
    "users:create",
    "users:update",
    "users:delete",
    "analytics:view",
    "audit:view",
  ],
}

/**
 * Routes accessibles par rôle
 */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  demandeur: [
    "/dashboard",
    "/dashboard/tickets",
    "/knowledge-base",
  ],
  agent: [
    "/dashboard",
    "/dashboard/tickets",
    "/dashboard/analytics",
    "/knowledge-base",
    "/dashboard/categories",
    "/dashboard/sla",
    "/dashboard/users",
  ],
  manager: [
    "/dashboard",
    "/dashboard/tickets",
    "/dashboard/analytics",
    "/knowledge-base",
    "/dashboard/categories",
    "/dashboard/sla",
    "/dashboard/users",
    "/admin",
  ],
  admin: [
    "/dashboard",
    "/dashboard/tickets",
    "/dashboard/analytics",
    "/knowledge-base",
    "/dashboard/categories",
    "/dashboard/sla",
    "/dashboard/users",
    "/admin",
  ],
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole]
  return permissions.includes(permission)
}

/**
 * Vérifie si un utilisateur a accès à une route
 */
export const hasRouteAccess = (userRole: UserRole, route: string): boolean => {
  const allowedRoutes = ROLE_ROUTES[userRole]
  
  // Vérifier si la route correspond exactement ou si c'est une sous-route
  return allowedRoutes.some(allowedRoute => {
    return route === allowedRoute || route.startsWith(allowedRoute + "/")
  })
}

/**
 * Vérifie si un utilisateur a au moins un des rôles spécifiés
 */
export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole)
}

/**
 * Vérifie si un utilisateur peut voir tous les tickets ou seulement les siens
 */
export const canViewAllTickets = (userRole: UserRole): boolean => {
  return hasPermission(userRole, "tickets:view_all")
}

/**
 * Vérifie si un utilisateur peut voir les performances SLA et agents
 */
export const canViewPerformanceMetrics = (userRole: UserRole): boolean => {
  return hasPermission(userRole, "dashboard:sla") && hasPermission(userRole, "dashboard:agents")
}
