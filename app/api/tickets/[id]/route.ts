import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ticketUpdateSchema } from "@/lib/validations/ticket"

// Récupérer un ticket par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier l'authentification pour filtrer les messages
    const token = request.cookies.get("auth-token")?.value
    let userRole = null
    
    if (token) {
      try {
        const { jwtVerify } = await import("jose")
        const JWT_SECRET = new TextEncoder().encode(
          process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
        )
        const { payload } = await jwtVerify(token, JWT_SECRET)
        userRole = (payload.role as string)?.toUpperCase()
      } catch (error) {
        // Token invalide, continuer sans rôle
      }
    }
    
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        sla: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        history: {
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
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket non trouvé" },
        { status: 404 }
      )
    }

    // Filtrer les messages internes pour les clients (DEMANDEUR)
    if (userRole === "DEMANDEUR") {
      ticket.messages = ticket.messages.filter(msg => msg.type === "PUBLIC")
    }

    return NextResponse.json({ success: true, ticket }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération du ticket:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Mettre à jour un ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validation des données
    const validatedData = ticketUpdateSchema.parse(body)
    const { assignedToId, ...updateData } = validatedData
    
    // Vérifier si le ticket existe et récupérer toutes les données nécessaires
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
      select: { 
        status: true, 
        assignedToId: true,
        priority: true,
        categoryId: true,
        createdById: true,
      },
    })

    if (!existingTicket) {
      return NextResponse.json(
        { success: false, error: "Ticket non trouvé" },
        { status: 404 }
      )
    }

    // Mettre à jour le ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...updateData,
        ...(assignedToId !== undefined && { assignedToId }),
        updatedAt: new Date(),
      },
      include: {
        category: true,
        createdBy: true,
        assignedTo: true,
        sla: true,
      },
    })

    // Enregistrer les changements dans l'historique
    // Récupérer l'utilisateur système ou créateur du ticket
    const systemUser = await prisma.user.findFirst({
      where: { email: 'system@ticketflow.com' }
    })
    const historyUserId = systemUser?.id || existingTicket.createdById

    const changes = []
    if (validatedData.priority && validatedData.priority !== existingTicket.priority) {
      changes.push({
        ticketId: id,
        userId: historyUserId,
        action: 'CHANGEMENT_PRIORITE',
        oldValue: existingTicket.priority,
        newValue: validatedData.priority,
      })
    }
    if (validatedData.status && validatedData.status !== existingTicket.status) {
      changes.push({
        ticketId: id,
        userId: historyUserId,
        action: 'CHANGEMENT_STATUT',
        oldValue: existingTicket.status,
        newValue: validatedData.status,
      })
    }
    if (assignedToId !== undefined && assignedToId !== existingTicket.assignedToId) {
      changes.push({
        ticketId: id,
        userId: historyUserId,
        action: 'ASSIGNATION',
        oldValue: existingTicket.assignedToId || 'Non assigné',
        newValue: assignedToId || 'Non assigné',
      })
    }
    if (validatedData.categoryId && validatedData.categoryId !== existingTicket.categoryId) {
      changes.push({
        ticketId: id,
        userId: historyUserId,
        action: 'CHANGEMENT_CATEGORIE',
        oldValue: existingTicket.categoryId,
        newValue: validatedData.categoryId,
      })
    }

    if (changes.length > 0) {
      await prisma.ticketHistory.createMany({ data: changes })
    }

    // Créer des notifications pour les mises à jour
    const notificationsToCreate: Array<{
      userId: string
      type: "CHANGEMENT_STATUT" | "TICKET_FERME"
      title: string
      message: string
      ticketId: string
    }> = []
    
    // 1. Notifier le créateur du ticket (client)
    if (existingTicket.createdById) {
      notificationsToCreate.push({
        userId: existingTicket.createdById,
        type: "CHANGEMENT_STATUT" as const,
        title: "Ticket mis à jour",
        message: `Votre ticket #${id} a été mis à jour`,
        ticketId: id,
      })
    }
    
    // 2. Notifier le responsable du ticket (agent/manager)
    if (updatedTicket.assignedToId && updatedTicket.assignedToId !== existingTicket.createdById) {
      notificationsToCreate.push({
        userId: updatedTicket.assignedToId,
        type: "CHANGEMENT_STATUT" as const,
        title: "Ticket mis à jour",
        message: `Le ticket #${id} dont vous êtes responsable a été mis à jour`,
        ticketId: id,
      })
    }
    
    // 3. Si le ticket est clôturé, notifier tous les admins, managers et agents
    if (validatedData.status === "FERME" && existingTicket.status !== "FERME") {
      const usersToNotify = await prisma.user.findMany({
        where: {
          OR: [
            { role: "ADMIN" },
            { role: "MANAGER" },
            { role: "AGENT" },
          ],
        },
        select: { id: true },
      })
      
      usersToNotify.forEach((user) => {
        // Éviter les doublons
        if (!notificationsToCreate.some(n => n.userId === user.id)) {
          notificationsToCreate.push({
            userId: user.id,
            type: "TICKET_FERME" as const,
            title: "Ticket clôturé",
            message: `Le ticket #${id} a été clôturé`,
            ticketId: id,
          })
        }
      })
    }
    
    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      })
    }

    return NextResponse.json(
      { success: true, ticket: updatedTicket },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la mise à jour du ticket:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du ticket" },
      { status: 500 }
    )
  }
}
