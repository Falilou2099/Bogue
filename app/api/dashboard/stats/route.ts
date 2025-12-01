import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"
import { canViewAllTickets, canViewPerformanceMetrics } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    
    // Filtrer selon le rôle (les clients ne voient que leurs propres tickets)
    const whereClause = canViewAllTickets(user.role)
      ? {}
      : { createdById: user.id }
    
    // Compter les tickets par statut
    const ticketsOuverts = await prisma.ticket.count({
      where: { ...whereClause, status: "OUVERT" },
    })

    const ticketsEnCours = await prisma.ticket.count({
      where: { ...whereClause, status: "EN_COURS" },
    })

    const ticketsResolus = await prisma.ticket.count({
      where: { ...whereClause, status: "RESOLU" },
    })

    const ticketsFermes = await prisma.ticket.count({
      where: { ...whereClause, status: "FERME" },
    })

    // Calculer le temps de résolution moyen (en heures)
    const ticketsWithTime = await prisma.ticket.findMany({
      where: {
        ...whereClause,
        status: { in: ["RESOLU", "FERME"] },
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    })

    const tempsResolutionMoyen =
      ticketsWithTime.length > 0
        ? ticketsWithTime.reduce((acc, ticket) => {
            const diff =
              (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) /
              (1000 * 60 * 60)
            return acc + diff
          }, 0) / ticketsWithTime.length
        : 0

    const stats: any = {
      ticketsOuverts,
      ticketsEnCours,
      ticketsResolus,
      ticketsFermes,
      tempsResolutionMoyen: Math.round(tempsResolutionMoyen * 10) / 10,
    }
    
    // Les clients (demandeurs) ne peuvent pas voir les performances SLA et agents
    if (canViewPerformanceMetrics(user.role)) {
      // Calculer le taux de respect des SLA (simplifié)
      const totalTickets = await prisma.ticket.count({ where: whereClause })
      const ticketsRespectSLA = await prisma.ticket.count({
        where: {
          ...whereClause,
          OR: [
            { status: "OUVERT" },
            { status: "EN_COURS" },
            {
              AND: [
                { resolvedAt: { not: null } },
                { dueDate: { not: null } },
              ],
            },
          ],
        },
      })

      const tauxSlaRespect =
        totalTickets > 0 ? (ticketsRespectSLA / totalTickets) * 100 : 0
      
      stats.tauxSlaRespect = Math.round(tauxSlaRespect * 10) / 10
    }

    return NextResponse.json({ success: true, stats }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
