import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
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
    // Vérifier l'authentification
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier le rôle (seuls admin, manager et agent peuvent créer des articles)
    const { jwtVerify } = await import("jose")
    const JWT_SECRET = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "votre-secret-jwt-super-securise-changez-moi"
    )
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = (payload.role as string)?.toLowerCase()
    const userId = payload.userId as string

    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Permissions insuffisantes" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, categoryId, tags, published } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Titre, contenu et catégorie sont requis" },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        categoryId,
        authorId: userId,
        tags: tags || [],
        published: published || false,
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
