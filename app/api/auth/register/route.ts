import { NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations/auth"
import { createUser } from "@/lib/auth"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des données avec Zod
    const validatedData = registerSchema.parse(body)

    // Créer l'utilisateur
    const user = await createUser(
      validatedData.name,
      validatedData.email,
      validatedData.password
    )

    return NextResponse.json(
      {
        success: true,
        message: "Utilisateur créé avec succès",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    // Erreur de validation Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Erreur d'email déjà existant
    if (error instanceof Error && error.message.includes("existe déjà")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 }
      )
    }

    // Erreur serveur
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la création de l'utilisateur",
      },
      { status: 500 }
    )
  }
}
