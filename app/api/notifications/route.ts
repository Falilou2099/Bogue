import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token du cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier et décoder le JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)

    const notifications = await prisma.notification.findMany({
      where: {
        userId: payload.userId as string,
      },
      include: {
        ticket: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    return NextResponse.json({ success: true, notifications }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
