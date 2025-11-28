import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const tickets = await prisma.ticket.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, tickets }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { title, description, type, priority, categoryId } = body

    // Validation des champs requis
    if (!title || !description || !type || !priority || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    // Déterminer le SLA en fonction de la priorité
    let slaId = "sla-3" // Par défaut MOYENNE
    switch(priority) {
      case "CRITIQUE": slaId = "sla-1"; break;
      case "HAUTE": slaId = "sla-2"; break;
      case "BASSE": slaId = "sla-4"; break;
    }

    // Générer un ID de ticket unique
    const ticketCount = await prisma.ticket.count()
    const ticketId = `TKT-${String(ticketCount + 1).padStart(3, '0')}`

    const ticket = await prisma.ticket.create({
      data: {
        id: ticketId,
        title,
        description,
        type,
        priority,
        status: "OUVERT",
        categoryId,
        createdById: userId,
        slaId,
        tags: [],
      },
      include: {
        category: true,
        createdBy: true,
        sla: true,
      },
    })

    // Créer une notification pour l'utilisateur
    await prisma.notification.createMany({
      data: [
        {
          userId: userId,
          type: "NOUVEAU_TICKET",
          title: "Ticket créé",
          message: `Votre ticket #${ticket.id} a été créé avec succès`,
          ticketId: ticket.id,
        },
      ],
    })

    // Créer une entrée dans l'historique
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId: userId,
        action: "CREATION",
        newValue: "Ticket créé",
      },
    })

    return NextResponse.json(
      { success: true, ticket },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de la création du ticket:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du ticket" },
      { status: 500 }
    )
  }
}
