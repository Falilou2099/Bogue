import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * API Route: Marquer le tutoriel comme terminé
 * POST /api/user/complete-tutorial
 * 
 * Sécurité: Authentification requise
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const userId = authResult.user.id

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedTutorial: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hasCompletedTutorial: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Tutoriel marqué comme terminé",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tutoriel:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

/**
 * API Route: Réinitialiser le tutoriel
 * DELETE /api/user/complete-tutorial
 * 
 * Permet de revoir le tutoriel
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const userId = authResult.user.id

    // Réinitialiser le tutoriel
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedTutorial: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hasCompletedTutorial: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Tutoriel réinitialisé",
    })
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du tutoriel:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
