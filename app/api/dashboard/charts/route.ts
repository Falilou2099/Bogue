import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "votre-secret-jwt-super-securise-changez-moi"
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    await jwtVerify(token, JWT_SECRET)

    // Données pour le graphique des tickets par jour (7 derniers jours)
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)

    const ticketsParJour = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(sevenDaysAgo.getDate() + i)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const [ouverts, resolus] = await Promise.all([
        prisma.ticket.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.ticket.count({
          where: {
            status: { in: ["RESOLU", "FERME"] },
            resolvedAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ])

      ticketsParJour.push({
        date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        ouverts,
        resolus,
      })
    }

    // Données pour le graphique par priorité
    const [critique, haute, moyenne, basse] = await Promise.all([
      prisma.ticket.count({ where: { priority: "CRITIQUE", status: { notIn: ["FERME"] } } }),
      prisma.ticket.count({ where: { priority: "HAUTE", status: { notIn: ["FERME"] } } }),
      prisma.ticket.count({ where: { priority: "MOYENNE", status: { notIn: ["FERME"] } } }),
      prisma.ticket.count({ where: { priority: "BASSE", status: { notIn: ["FERME"] } } }),
    ])

    const ticketsParPriorite = [
      { name: "Critique", value: critique, fill: "#ef4444" },
      { name: "Haute", value: haute, fill: "#f97316" },
      { name: "Moyenne", value: moyenne, fill: "#eab308" },
      { name: "Basse", value: basse, fill: "#22c55e" },
    ]

    // Performance des agents (top 5)
    const agentPerformance = await prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        assignedTickets: {
          where: {
            status: { in: ["RESOLU", "FERME"] },
          },
          select: {
            id: true,
          },
        },
      },
      take: 5,
    })

    const agentPerformanceData = agentPerformance.map((agent) => ({
      agentId: agent.id,
      agent: {
        name: agent.name,
        avatar: agent.avatar,
      },
      ticketsResolus: agent.assignedTickets.length,
      tauxSatisfaction: Math.floor(Math.random() * 20) + 80, // Simulé pour l'instant
    }))

    return NextResponse.json(
      {
        success: true,
        charts: {
          ticketsParJour,
          ticketsParPriorite,
          agentPerformance: agentPerformanceData,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération des graphiques:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
