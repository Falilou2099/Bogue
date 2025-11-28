import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const history = await prisma.ticketHistory.findMany({
      where: { ticketId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      { success: true, history },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    )
  }
}
