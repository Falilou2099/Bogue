import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const slas = await prisma.sLA.findMany({
      orderBy: {
        responseTime: "asc",
      },
    })

    return NextResponse.json({ success: true, slas }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des SLA:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
