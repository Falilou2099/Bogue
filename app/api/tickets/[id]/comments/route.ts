import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, userId } = body

    if (!content || !userId) {
      return NextResponse.json(
        { success: false, error: "Contenu et utilisateur requis" },
        { status: 400 }
      )
    }

    // Créer le message
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: userId,
        content,
        type: "PUBLIC",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    // Ajouter à l'historique
    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        userId,
        action: "COMMENTAIRE",
        newValue: content,
      },
    })

    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'ajout du commentaire" },
      { status: 500 }
    )
  }
}
