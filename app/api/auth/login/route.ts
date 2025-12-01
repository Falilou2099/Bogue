import { NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations/auth"
import { authenticateUser } from "@/lib/auth"
import { ZodError } from "zod"
import { SignJWT } from "jose"
import { loginRateLimiter } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

// Secret pour JWT (à déplacer dans .env en production)
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 tentatives par 15 minutes
    const rateLimitResult = await loginRateLimiter(request)
    
    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime)
      return NextResponse.json(
        {
          success: false,
          error: "Trop de tentatives de connexion. Réessayez plus tard.",
          retryAfter: resetDate.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validation des données avec Zod
    const validatedData = loginSchema.parse(body)

    // Authentifier l'utilisateur
    const user = await authenticateUser(
      validatedData.email,
      validatedData.password
    )

    if (!user) {
      // Log tentative de connexion échouée
      await prisma.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entityType: "USER",
          entityId: validatedData.email,
          details: `Tentative de connexion échouée pour ${validatedData.email}`,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        },
      }).catch((err: Error) => console.error("Erreur log audit:", err))

      return NextResponse.json(
        {
          success: false,
          error: "Email ou mot de passe incorrect",
        },
        { status: 401 }
      )
    }

    // Log connexion réussie
    await prisma.auditLog.create({
      data: {
        action: "LOGIN_SUCCESS",
        entityType: "USER",
        entityId: user.id,
        userId: user.id,
        details: `Connexion réussie pour ${user.email}`,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      },
    }).catch((err: Error) => console.error("Erreur log audit:", err))

    // Créer un JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      role: user.role 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m") // Token valide 30 minutes
      .sign(JWT_SECRET)

    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Connexion réussie",
        user,
      },
      { status: 200 }
    )

    // Définir le cookie HTTP-only sécurisé
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 30, // 30 minutes
      path: "/",
    })

    return response
  } catch (error) {
    // Erreur de validation Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Erreur serveur
    console.error("Erreur lors de la connexion:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la connexion",
      },
      { status: 500 }
    )
  }
}
