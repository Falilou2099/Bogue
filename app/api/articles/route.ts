import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: {
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
        views: "desc",
      },
    })

    return NextResponse.json({ success: true, articles }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
