import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getUserById } from "./auth"
import type { User, UserRole } from "./types"
import type { Permission } from "./permissions"
import { hasPermission, hasRouteAccess } from "./permissions"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

/**
 * Interface pour le résultat de l'authentification
 */
export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

/**
 * Middleware pour vérifier l'authentification via JWT
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return {
        success: false,
        error: "Non authentifié - Token manquant",
      }
    }

    // Vérifier le token JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Récupérer l'utilisateur
    const user = await getUserById(payload.userId as string)

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non trouvé",
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error)
    return {
      success: false,
      error: "Token invalide ou expiré",
    }
  }
}

/**
 * Middleware pour vérifier les permissions
 */
export async function requireAuth(
  request: NextRequest,
  options?: {
    requiredPermissions?: Permission[]
    requiredRoles?: UserRole[]
  }
): Promise<{ user: User } | NextResponse> {
  const authResult = await verifyAuth(request)

  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        error: authResult.error || "Non authentifié",
      },
      { status: 401 }
    )
  }

  const user = authResult.user

  // Vérifier les rôles requis
  if (options?.requiredRoles && !options.requiredRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: "Permissions insuffisantes - Rôle non autorisé",
      },
      { status: 403 }
    )
  }

  // Vérifier les permissions requises
  if (options?.requiredPermissions) {
    const hasAllPermissions = options.requiredPermissions.every((permission) =>
      hasPermission(user.role, permission)
    )

    if (!hasAllPermissions) {
      return NextResponse.json(
        {
          success: false,
          error: "Permissions insuffisantes",
        },
        { status: 403 }
      )
    }
  }

  return { user }
}

/**
 * Middleware pour vérifier l'accès à une route
 */
export async function requireRouteAccess(
  request: NextRequest,
  route: string
): Promise<{ user: User } | NextResponse> {
  const authResult = await verifyAuth(request)

  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      {
        success: false,
        error: authResult.error || "Non authentifié",
      },
      { status: 401 }
    )
  }

  const user = authResult.user

  if (!hasRouteAccess(user.role, route)) {
    return NextResponse.json(
      {
        success: false,
        error: "Accès refusé à cette route",
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Helper pour extraire l'utilisateur d'une requête authentifiée
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authResult = await verifyAuth(request)
  return authResult.user || null
}
