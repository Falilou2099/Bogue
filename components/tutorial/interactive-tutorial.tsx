"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTutorial } from "@/lib/tutorial-context"

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // Sélecteur CSS de l'élément à pointer
  position: "top" | "bottom" | "left" | "right"
  action?: string // Action attendue (optionnel)
  navigateTo?: string // URL vers laquelle naviguer (optionnel)
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
    position: "top",
    navigateTo: "/tickets",
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
    navigateTo: "/knowledge-base",
  },
  {
    id: "kb-search",
    title: "🔍 Recherche dans la base",
    description: "Trouvez rapidement des articles et des guides pour résoudre vos problèmes.",
    target: "[data-tutorial='kb-search']",
    position: "bottom",
  },
  {
    id: "kb-create",
    title: "✍️ Créer un article",
    description: "Les agents peuvent créer des articles pour partager leurs connaissances et aider les autres utilisateurs.",
    target: "[data-tutorial='kb-create']",
    position: "left",
  },
  {
    id: "notifications",
    title: "🔔 Notifications",
    description: "Restez informé des mises à jour de vos tickets. Les notifications apparaissent ici en temps réel.",
    target: "[data-tutorial='notifications']",
    position: "bottom",
    navigateTo: "/dashboard",
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
    navigateTo: "/dashboard",
  },
]

interface InteractiveTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export function InteractiveTutorial({ onComplete, onSkip }: InteractiveTutorialProps) {
  const router = useRouter()
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 })

  // Importer le contexte du tutoriel
  const { currentStep, setCurrentStep } = useTutorial()

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  useEffect(() => {
    // Navigation automatique si nécessaire
    if (step.navigateTo) {
      router.push(step.navigateTo)
      // Attendre que la navigation soit terminée avant de chercher l'élément
      setTimeout(() => {
        findAndHighlightElement()
      }, 500)
    } else {
      findAndHighlightElement()
    }

    function findAndHighlightElement() {
      if (step.target) {
        const element = document.querySelector(step.target) as HTMLElement
        if (element) {
          setTargetElement(element)
          highlightElement(element)
          scrollToElement(element)
          calculateCardPosition(element)
        }
      }
    }

    function highlightElement(element: HTMLElement) {
      element.classList.add("tutorial-highlight")
    }

    function scrollToElement(element: HTMLElement) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    function calculateCardPosition(element: HTMLElement) {
      setTimeout(() => {
        const rect = element.getBoundingClientRect()
        const cardWidth = 400
        const cardHeight = 300
        const padding = 20
        
        let top = 0
        let left = 0
        
        switch (step.position) {
          case "top":
            top = rect.top - cardHeight - padding
            left = rect.left + rect.width / 2 - cardWidth / 2
            break
          case "bottom":
            top = rect.bottom + padding
            left = rect.left + rect.width / 2 - cardWidth / 2
            break
          case "left":
            top = rect.top + rect.height / 2 - cardHeight / 2
            left = rect.left - cardWidth - padding
            break
          case "right":
            top = rect.top + rect.height / 2 - cardHeight / 2
            left = rect.right + padding
            break
        }
        
        // S'assurer que la carte reste dans la fenêtre
        top = Math.max(padding, Math.min(top, window.innerHeight - cardHeight - padding))
        left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding))
        
        setCardPosition({ top, left })
      }, 100)
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove("tutorial-highlight")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <>
      {/* Overlay sombre */}
      <div className="fixed inset-0 bg-black/60 z-[9998] animate-in fade-in duration-300" />

      {/* Carte du tutoriel */}
      <div
        className="fixed z-[10001] bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-[400px] transition-all duration-500 ease-out"
        style={
          step.target && targetElement
            ? { top: `${cardPosition.top}px`, left: `${cardPosition.left}px` }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        }
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

    </>
  )
}
