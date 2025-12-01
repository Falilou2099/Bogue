import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, type = "PUBLIC" } = body

    // Vérifier l'authentification
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { jwtVerify } = await import("jose")
    const JWT_SECRET = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
    )
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Contenu requis" },
        { status: 400 }
      )
    }

    // Vérifier que le ticket existe et récupérer les infos
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { 
        createdById: true,
        assignedToId: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket non trouvé" },
        { status: 404 }
      )
    }

    // Créer le message
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: userId,
        content,
        type: type === "INTERNE" ? "INTERNE" : "PUBLIC",
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
        newValue: type === "INTERNE" ? `[Interne] ${content}` : content,
      },
    })

    // Créer des notifications (sauf pour les commentaires internes aux clients)
    const notificationsToCreate: Array<{
      userId: string
      type: "NOUVEAU_MESSAGE"
      title: string
      message: string
      ticketId: string
    }> = []

    // Si commentaire PUBLIC, notifier tout le monde concerné
    if (type === "PUBLIC") {
      // Notifier le créateur du ticket (s'il n'est pas l'auteur du commentaire)
      if (ticket.createdById && ticket.createdById !== userId) {
        notificationsToCreate.push({
          userId: ticket.createdById,
          type: "NOUVEAU_MESSAGE",
          title: "Nouveau commentaire",
          message: `Un nouveau commentaire a été ajouté sur le ticket #${id}`,
          ticketId: id,
        })
      }

      // Notifier le responsable (s'il existe et n'est pas l'auteur)
      if (ticket.assignedToId && ticket.assignedToId !== userId && ticket.assignedToId !== ticket.createdById) {
        notificationsToCreate.push({
          userId: ticket.assignedToId,
          type: "NOUVEAU_MESSAGE",
          title: "Nouveau commentaire",
          message: `Un nouveau commentaire a été ajouté sur le ticket #${id}`,
          ticketId: id,
        })
      }
    } 
    // Si commentaire INTERNE, notifier uniquement le responsable (pas le client)
    else if (type === "INTERNE") {
      // Notifier le responsable (s'il existe et n'est pas l'auteur)
      if (ticket.assignedToId && ticket.assignedToId !== userId) {
        notificationsToCreate.push({
          userId: ticket.assignedToId,
          type: "NOUVEAU_MESSAGE",
          title: "Nouveau commentaire interne",
          message: `Un commentaire interne a été ajouté sur le ticket #${id}`,
          ticketId: id,
        })
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      })
    }

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
