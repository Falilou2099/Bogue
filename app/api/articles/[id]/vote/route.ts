import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type } = body

    if (type !== 'helpful' && type !== 'notHelpful') {
      return NextResponse.json(
        { success: false, error: "Type de vote invalide" },
        { status: 400 }
      )
    }

    // Incrémenter le compteur approprié
    const article = await prisma.article.update({
      where: { id },
      data: {
        [type]: {
          increment: 1,
        },
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, article }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors du vote:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
