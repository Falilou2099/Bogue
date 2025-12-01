'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuth } from "@/lib/auth-context"
import { OnboardingTutorial } from "@/components/tutorial/onboarding-tutorial"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Vérifier si l'utilisateur doit voir le tutoriel
  useEffect(() => {
    if (user && !user.hasCompletedTutorial) {
      setShowTutorial(true)
    }
  }, [user])

  const handleCompleteTutorial = async () => {
    try {
      const response = await fetch("/api/user/complete-tutorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setShowTutorial(false)
        // Rafraîchir les données utilisateur
        window.location.reload()
      }
    } catch (error) {
      console.error("Erreur lors de la complétion du tutoriel:", error)
    }
  }

  const handleSkipTutorial = async () => {
    try {
      await fetch("/api/user/complete-tutorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      setShowTutorial(false)
    } catch (error) {
      console.error("Erreur lors du skip du tutoriel:", error)
      setShowTutorial(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden w-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 w-full">{children}</main>
      </div>

      {/* Tutoriel d'onboarding */}
      {showTutorial && (
        <OnboardingTutorial
          userRole={user.role}
          onComplete={handleCompleteTutorial}
          onSkip={handleSkipTutorial}
        />
      )}
    </div>
  )
}
