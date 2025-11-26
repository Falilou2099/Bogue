"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, UserRole } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers[0]) // Default: admin pour la démo

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false
      return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
    },
    [user],
  )

  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
