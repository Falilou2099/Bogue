"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import type { Permission } from "@/lib/permissions"
import { hasPermission } from "@/lib/permissions"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission: Permission
  fallback?: React.ReactNode
}

/**
 * Composant pour afficher conditionnellement du contenu basé sur les permissions
 * 
 * @example
 * <PermissionGuard requiredPermission="users:create">
 *   <Button>Créer un utilisateur</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  requiredPermission,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  if (!hasPermission(user.role, requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: Array<"demandeur" | "agent" | "manager" | "admin">
  fallback?: React.ReactNode
}

/**
 * Composant pour afficher conditionnellement du contenu basé sur les rôles
 * 
 * @example
 * <RoleGuard allowedRoles={["admin", "manager"]}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
