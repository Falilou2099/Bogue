import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions (ADMIN et MANAGER uniquement)
    const authResult = await requireAuth(request, {
      requiredPermissions: ["categories:update"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { id } = await params
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Le nom est requis" },
        { status: 400 }
      )
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json(
      { success: true, category },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions (ADMIN et MANAGER uniquement)
    const authResult = await requireAuth(request, {
      requiredPermissions: ["categories:delete"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { id } = await params

    // Vérifier s'il y a des tickets associés
    const ticketCount = await prisma.ticket.count({
      where: { categoryId: id },
    })

    if (ticketCount > 0) {
      return NextResponse.json(
        { success: false, error: `Impossible de supprimer cette catégorie car ${ticketCount} ticket(s) y sont associés` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: "Catégorie supprimée" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}
