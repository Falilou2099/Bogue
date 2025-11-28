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
    const body = await request.json()
    const { title, content, excerpt, categoryId, authorId, tags } = body

    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { success: false, error: "Titre, contenu, catégorie et auteur sont requis" },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        categoryId,
        authorId,
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
