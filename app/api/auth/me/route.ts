import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getUserById } from "@/lib/auth"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token du cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Non authentifié",
        },
        { status: 401 }
      )
    }

    // Vérifier le token JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Récupérer l'utilisateur
    const user = await getUserById(payload.userId as string)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Token invalide ou expiré",
      },
      { status: 401 }
    )
  }
}
