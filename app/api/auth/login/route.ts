import { NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations/auth"
import { authenticateUser } from "@/lib/auth"
import { ZodError } from "zod"
import { SignJWT } from "jose"

// Secret pour JWT (à déplacer dans .env en production)
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des données avec Zod
    const validatedData = loginSchema.parse(body)

    // Authentifier l'utilisateur
    const user = await authenticateUser(
      validatedData.email,
      validatedData.password
    )

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Email ou mot de passe incorrect",
        },
        { status: 401 }
      )
    }

    // Créer un JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      role: user.role 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Token valide 7 jours
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
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
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
