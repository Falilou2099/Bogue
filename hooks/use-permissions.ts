import { useAuth } from "@/lib/auth-context"
import type { Permission } from "@/lib/permissions"
import {
  hasPermission,
  canViewAllTickets,
  canViewPerformanceMetrics,
} from "@/lib/permissions"

/**
 * Hook personnalisé pour vérifier les permissions de l'utilisateur
 */
export function usePermissions() {
  const { user } = useAuth()

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  const checkMultiplePermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return permissions.every((permission) => hasPermission(user.role, permission))
  }

  const canView = {
    allTickets: user ? canViewAllTickets(user.role) : false,
    performanceMetrics: user ? canViewPerformanceMetrics(user.role) : false,
  }

  return {
    checkPermission,
    checkMultiplePermissions,
    canView,
    userRole: user?.role,
  }
}
