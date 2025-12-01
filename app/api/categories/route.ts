import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request, {
      requiredPermissions: ["categories:view"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { searchParams } = new URL(request.url)
    const includeTickets = searchParams.get('includeTickets') === 'true'

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { tickets: true }
        },
        ...(includeTickets && {
          tickets: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              category: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        }),
      },
    })

    return NextResponse.json({ success: true, categories }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions (ADMIN et MANAGER uniquement)
    const authResult = await requireAuth(request, {
      requiredPermissions: ["categories:create"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: "Nom et description requis" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(
      { success: true, category },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création" },
      { status: 500 }
    )
  }
}
