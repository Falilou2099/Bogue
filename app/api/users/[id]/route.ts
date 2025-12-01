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
      requiredPermissions: ["users:update"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { id } = await params
    const body = await request.json()
    const { name, email, role } = body

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
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
      requiredPermissions: ["users:delete"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { id } = await params

    // Vérifier si l'utilisateur a des tickets
    const ticketCount = await prisma.ticket.count({
      where: {
        OR: [
          { createdById: id },
          { assignedToId: id },
        ],
      },
    })

    if (ticketCount > 0) {
      return NextResponse.json(
        { success: false, error: `Impossible de supprimer cet utilisateur car il a ${ticketCount} ticket(s) associé(s)` },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: "Utilisateur supprimé" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}
