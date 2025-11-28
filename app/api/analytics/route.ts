import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Statistiques des tickets par statut
    const [ouvert, enCours, resolu, ferme, enAttente] = await Promise.all([
      prisma.ticket.count({ where: { status: "OUVERT" } }),
      prisma.ticket.count({ where: { status: "EN_COURS" } }),
      prisma.ticket.count({ where: { status: "RESOLU" } }),
      prisma.ticket.count({ where: { status: "FERME" } }),
      prisma.ticket.count({ where: { status: "EN_ATTENTE" } }),
    ])

    // Statistiques des priorités
    const [critique, haute, moyenne, basse] = await Promise.all([
      prisma.ticket.count({ where: { priority: "CRITIQUE" } }),
      prisma.ticket.count({ where: { priority: "HAUTE" } }),
      prisma.ticket.count({ where: { priority: "MOYENNE" } }),
      prisma.ticket.count({ where: { priority: "BASSE" } }),
    ])

    // Tickets par catégorie
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    })

    const categoryStats = categories.map((cat) => ({
      name: cat.name,
      count: cat._count.tickets,
    }))

    // Évolution quotidienne (7 derniers jours)
    const dailyTickets = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const count = await prisma.ticket.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })
      
      dailyTickets.push({
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        count,
      })
    }

    // Performance des agents
    const agents = await prisma.user.findMany({
      where: {
        role: { in: ["AGENT", "MANAGER", "ADMIN"] },
      },
      include: {
        assignedTickets: {
          where: {
            status: "RESOLU",
          },
        },
      },
    })

    const agentPerformance = agents.map((agent) => ({
      name: agent.name,
      resolved: agent.assignedTickets.length,
      avgTime: Math.floor(Math.random() * 48) + 12, // Simulation du temps moyen
    }))

    // Calculs moyens
    const resolvedTickets = await prisma.ticket.findMany({
      where: { status: "RESOLU" },
      select: { 
        createdAt: true, 
        resolvedAt: true,
      },
    })

    let totalResolutionTime = 0
    let validTickets = 0
    
    resolvedTickets.forEach((ticket) => {
      if (ticket.resolvedAt) {
        const timeDiff = ticket.resolvedAt.getTime() - ticket.createdAt.getTime()
        totalResolutionTime += timeDiff
        validTickets++
      }
    })

    const avgResolutionTime = validTickets > 0 
      ? Math.floor(totalResolutionTime / validTickets / (1000 * 60 * 60)) // en heures
      : 24

    // Taux de satisfaction (simulation basée sur les tickets résolus)
    const satisfactionRate = resolu > 0 ? Math.floor((resolu / (resolu + ferme)) * 100) : 85

    const data = {
      ticketStats: {
        total: ouvert + enCours + resolu + ferme + enAttente,
        ouvert,
        enCours: enCours + enAttente,
        resolu,
        ferme,
      },
      priorityStats: {
        critique,
        haute,
        moyenne,
        basse,
      },
      categoryStats,
      dailyTickets,
      agentPerformance,
      avgResolutionTime,
      satisfactionRate,
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération des analytics:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
