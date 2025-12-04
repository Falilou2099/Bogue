import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"]

// Routes par rôle
const ROLE_ROUTES = {
  demandeur: ["/dashboard", "/tickets", "/knowledge-base", "/settings"],
  agent: [
    "/dashboard",
    "/tickets",
    "/knowledge-base",
    "/settings",
  ],
  manager: [
    "/dashboard",
    "/tickets",
    "/knowledge-base",
    "/admin",
    "/settings",
  ],
  admin: [
    "/dashboard",
    "/tickets",
    "/knowledge-base",
    "/admin",
    "/settings",
  ],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permettre l'accès aux routes publiques
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Permettre l'accès aux routes API (gérées par les middlewares API)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Permettre l'accès aux fichiers statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Vérifier l'authentification
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // Rediriger vers login si pas de token
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Vérifier le token JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = payload.role as string

    // Si pas de rôle dans le token, rediriger vers login
    if (!userRole) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Normaliser le rôle (convertir en minuscules)
    const normalizedRole = userRole.toLowerCase() as keyof typeof ROLE_ROUTES

    // Vérifier si l'utilisateur a accès à cette route
    const allowedRoutes = ROLE_ROUTES[normalizedRole] || []
    
    // Vérifier l'accès : la route doit correspondre exactement ou commencer par une route autorisée
    const hasAccess = allowedRoutes.some((route) => {
      // Correspondance exacte
      if (pathname === route) return true
      
      // Correspondance avec sous-routes (ex: /dashboard/tickets autorise /dashboard/tickets/new)
      if (pathname.startsWith(route + "/")) return true
      
      return false
    })

    // Debug log
    console.log("Proxy check:", { pathname, normalizedRole, allowedRoutes, hasAccess })

    if (!hasAccess) {
      // Rediriger vers le dashboard par défaut si accès refusé
      console.log("Access denied, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error: any) {
    console.error("Erreur de vérification du token:", error)
    
    // Si c'est une erreur de signature (token créé avec un autre secret), on laisse passer vers login
    if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' && pathname === '/login') {
      return NextResponse.next()
    }
    
    // Token invalide, rediriger vers login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
