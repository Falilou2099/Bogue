import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.ticketHistory.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limiter à 100 derniers logs
    })

    return NextResponse.json(
      { success: true, logs },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération des logs d'audit:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
