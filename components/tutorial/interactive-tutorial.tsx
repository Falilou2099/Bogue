"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // Sélecteur CSS de l'élément à pointer
  position: "top" | "bottom" | "left" | "right"
  action?: string // Action attendue (optionnel)
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "👋 Bienvenue sur TicketFlow !",
    description: "Je vais vous guider à travers les fonctionnalités principales de l'application. Cliquez sur 'Suivant' pour commencer.",
    target: "",
    position: "bottom",
  },
  {
    id: "create-ticket",
    title: "📝 Créer un ticket",
    description: "Cliquez sur ce bouton pour créer votre premier ticket de support. C'est ici que tout commence !",
    target: "[data-tutorial='create-ticket']",
    position: "left",
    action: "Cliquez sur 'Nouveau Ticket'",
  },
  {
    id: "tickets-list",
    title: "📋 Liste des tickets",
    description: "Ici vous trouverez tous vos tickets. Vous pouvez les filtrer par statut : Tous, Ouverts, En cours, ou Résolus.",
    target: "[data-tutorial='tickets-tabs']",
    position: "bottom",
  },
  {
    id: "search",
    title: "🔍 Recherche rapide",
    description: "Utilisez la barre de recherche pour trouver rapidement un ticket par titre, ID ou description.",
    target: "[data-tutorial='search-bar']",
    position: "bottom",
  },
  {
    id: "filters",
    title: "🎯 Filtres avancés",
    description: "Cliquez sur 'Filtres' pour affiner votre recherche par catégorie, priorité, ou date.",
    target: "[data-tutorial='filters-button']",
    position: "left",
  },
  {
    id: "sidebar-tickets",
    title: "🎫 Navigation - Tickets",
    description: "Accédez à tous vos tickets depuis le menu latéral. C'est votre espace de travail principal.",
    target: "[data-tutorial='sidebar-tickets']",
    position: "right",
  },
  {
    id: "sidebar-kb",
    title: "📚 Base de connaissances",
    description: "Consultez les articles d'aide et les guides pour résoudre vos problèmes rapidement.",
    target: "[data-tutorial='sidebar-kb']",
    position: "right",
  },
  {
    id: "notifications",
    title: "🔔 Notifications",
    description: "Restez informé des mises à jour de vos tickets. Les notifications apparaissent ici en temps réel.",
    target: "[data-tutorial='notifications']",
    position: "bottom",
  },
  {
    id: "profile",
    title: "👤 Profil utilisateur",
    description: "Gérez vos paramètres, changez votre mot de passe, ou déconnectez-vous depuis ce menu.",
    target: "[data-tutorial='user-menu']",
    position: "bottom",
  },
  {
    id: "complete",
    title: "🎉 Félicitations !",
    description: "Vous maîtrisez maintenant les bases de TicketFlow. N'hésitez pas à explorer davantage !",
    target: "",
    position: "bottom",
  },
]

interface InteractiveTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export function InteractiveTutorial({ onComplete, onSkip }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 })

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        setTargetElement(element)
        
        // Highlight l'élément
        element.classList.add("tutorial-highlight")
        element.style.position = "relative"
        element.style.zIndex = "9999"
        
        // Scroll vers l'élément
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        
        // Calculer position de la flèche
        const rect = element.getBoundingClientRect()
        setArrowPosition({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2,
        })
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove("tutorial-highlight")
        targetElement.style.zIndex = ""
      }
    }
  }, [currentStep, step.target])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <>
      {/* Overlay sombre */}
      <div className="fixed inset-0 bg-black/60 z-[9998] animate-in fade-in duration-300" />

      {/* Flèche pointant vers l'élément */}
      {step.target && targetElement && (
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{
            top: `${arrowPosition.top}px`,
            left: `${arrowPosition.left}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-blue-500" />
            </div>
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-2 h-16 bg-blue-500" />
          </div>
        </div>
      )}

      {/* Carte du tutoriel */}
      <div
        className={cn(
          "fixed z-[10001] bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-[400px] animate-in slide-in-from-bottom duration-300",
          step.target ? "bottom-8 right-8" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Étape {currentStep + 1} sur {TUTORIAL_STEPS.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {step.description}
        </p>

        {/* Action attendue */}
        {step.action && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              💡 Action : {step.action}
            </p>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            Précédent
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLastStep ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Terminer
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Bouton Passer */}
        <button
          onClick={handleSkip}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Passer le tutoriel
        </button>
      </div>

      {/* Styles pour le highlight */}
      <style jsx global>{`
        .tutorial-highlight {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 8px !important;
          animation: pulse-highlight 2s infinite;
        }

        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.6), 0 0 0 12px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </>
  )
}
