"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface TutorialContextType {
  showTutorial: boolean
  currentStep: number
  setShowTutorial: (show: boolean) => void
  setCurrentStep: (step: number) => void
  startTutorial: () => void
  completeTutorial: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Charger l'état depuis localStorage au démarrage
  useEffect(() => {
    const savedState = localStorage.getItem("tutorial-state")
    if (savedState) {
      const { show, step } = JSON.parse(savedState)
      setShowTutorial(show)
      setCurrentStep(step)
    }
  }, [])

  // Sauvegarder l'état dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(
      "tutorial-state",
      JSON.stringify({ show: showTutorial, step: currentStep })
    )
  }, [showTutorial, currentStep])

  const startTutorial = () => {
    setShowTutorial(true)
    setCurrentStep(0)
  }

  const completeTutorial = async () => {
    setShowTutorial(false)
    setCurrentStep(0)
    localStorage.removeItem("tutorial-state")
    
    // Appeler l'API pour marquer le tutoriel comme terminé
    try {
      await fetch("/api/user/complete-tutorial", { method: "POST" })
    } catch (error) {
      console.error("Erreur lors de la complétion du tutoriel:", error)
    }
  }

  return (
    <TutorialContext.Provider
      value={{
        showTutorial,
        currentStep,
        setShowTutorial,
        setCurrentStep,
        startTutorial,
        completeTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}
