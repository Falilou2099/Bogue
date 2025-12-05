import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"
import DOMPurify from 'isomorphic-dompurify';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await requireAuth(request, {
      requiredPermissions: ["kb:view"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const articles = await prisma.article.findMany({
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
      orderBy: {
        views: "desc",
      },
    })

    return NextResponse.json({ success: true, articles }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error)
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
      requiredPermissions: ["kb:create"],
    })
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult

    const body = await request.json()
    const { title, content, categoryId } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Titre, contenu et catégorie sont requis" },
        { status: 400 }
      )
    }

    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });

    const article = await prisma.article.create({
      data: {
        title,
        content: sanitizedContent,
        categoryId,
        authorId: user.id,
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
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création" },
      { status: 500 }
    )
  }
}
