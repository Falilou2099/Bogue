import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"
import { canViewAllTickets } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    
    // Vérifier si on demande uniquement les tickets non assignés
    const { searchParams } = new URL(request.url)
    const unassignedOnly = searchParams.get('unassigned') === 'true'
    
    // Filtrer les tickets selon le rôle
    let whereClause: any = canViewAllTickets(user.role)
      ? {} // Admin, Manager, Agent peuvent voir tous les tickets
      : { createdById: user.id } // Demandeur ne voit que ses propres tickets
    
    // Ajouter le filtre des tickets non assignés si demandé
    if (unassignedOnly && canViewAllTickets(user.role)) {
      whereClause.assignedToId = null
    }
    
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
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

    // Vérifier que la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: `La catégorie ${categoryId} n'existe pas. Veuillez créer les catégories d'abord.` },
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

    // Récupérer tous les utilisateurs (admins, managers, agents) pour les notifier
    const usersToNotify = await prisma.user.findMany({
      where: {
        OR: [
          { role: "ADMIN" },
          { role: "MANAGER" },
          { role: "AGENT" },
          { id: userId }, // Le créateur du ticket
        ],
      },
      select: { id: true },
    })

    // Créer des notifications pour tous les utilisateurs concernés
    const notifications = usersToNotify.map((user) => ({
      userId: user.id,
      type: "NOUVEAU_TICKET" as const,
      title: user.id === userId ? "Ticket créé" : "Nouveau ticket",
      message: user.id === userId 
        ? `Votre ticket #${ticket.id} a été créé avec succès`
        : `Un nouveau ticket #${ticket.id} a été créé par ${ticket.createdBy.name}`,
      ticketId: ticket.id,
    }))

    await prisma.notification.createMany({
      data: notifications,
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
  } catch (error: any) {
    console.error("Erreur lors de la création du ticket:", error)
    console.error("Stack trace:", error.stack)
    console.error("Message:", error.message)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la création du ticket" },
      { status: 500 }
    )
  }
}
