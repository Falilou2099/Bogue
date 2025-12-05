import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sanitizeText } from '@/lib/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article non trouvé" },
        { status: 404 }
      )
    }

    // Incrémenter les vues
    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(
      { success: true, article },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, categoryId } = body

    const sanitizedContent = content ? sanitizeText(content) : undefined;

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(sanitizedContent && { content: sanitizedContent }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, article },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error)
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
    // Vérifier l'authentification
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier le rôle (seuls les admins peuvent supprimer)
    const { jwtVerify } = await import("jose")
    const JWT_SECRET = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
    )
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = (payload.role as string)?.toLowerCase()

    if (userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Permissions insuffisantes" },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.article.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: "Article supprimé" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}
