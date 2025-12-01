"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TutorialStep {
  title: string
  description: string
  target?: string
  action?: string
}

interface OnboardingTutorialProps {
  userRole: "ADMIN" | "MANAGER" | "AGENT" | "DEMANDEUR"
  onComplete: () => void
  onSkip: () => void
}

const tutorialSteps: Record<string, TutorialStep[]> = {
  ADMIN: [
    {
      title: "Bienvenue, Administrateur !",
      description: "En tant qu'admin, vous avez accès à toutes les fonctionnalités de TicketFlow. Laissez-moi vous guider.",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Créez et gérez les comptes utilisateurs (agents, managers, demandeurs). Allez dans Paramètres → Utilisateurs.",
      target: "users-menu",
    },
    {
      title: "Configuration des catégories",
      description: "Organisez vos tickets avec des catégories personnalisées. Configurez-les dans Paramètres → Catégories.",
      target: "categories-menu",
    },
    {
      title: "Gestion des SLA",
      description: "Définissez des accords de niveau de service pour garantir des temps de réponse. Paramètres → SLA.",
      target: "sla-menu",
    },
    {
      title: "Logs d'audit",
      description: "Surveillez toutes les actions sensibles dans Admin → Logs d'audit pour la sécurité.",
      target: "audit-menu",
    },
    {
      title: "Prêt à démarrer !",
      description: "Vous êtes maintenant prêt à administrer TicketFlow. Explorez le dashboard pour voir les statistiques.",
    },
  ],
  MANAGER: [
    {
      title: "Bienvenue, Manager !",
      description: "En tant que manager, vous supervisez les tickets et les équipes. Découvrons vos outils.",
    },
    {
      title: "Dashboard Analytics",
      description: "Consultez les statistiques en temps réel : tickets ouverts, temps de résolution, performance des agents.",
      target: "dashboard",
    },
    {
      title: "Gestion des tickets",
      description: "Assignez des tickets aux agents, modifiez les priorités et suivez l'avancement.",
      target: "tickets-menu",
    },
    {
      title: "Base de connaissances",
      description: "Créez des articles pour aider vos agents et clients à résoudre les problèmes courants.",
      target: "kb-menu",
    },
    {
      title: "Rapports SLA",
      description: "Vérifiez que les SLA sont respectés et identifiez les tickets en retard.",
      target: "sla-reports",
    },
    {
      title: "C'est parti !",
      description: "Vous maîtrisez maintenant les outils de gestion. Bon travail !",
    },
  ],
  AGENT: [
    {
      title: "Bienvenue, Agent !",
      description: "Vous êtes en première ligne pour résoudre les tickets. Voici comment bien démarrer.",
    },
    {
      title: "Vos tickets assignés",
      description: "Consultez les tickets qui vous sont assignés dans la section 'Mes Tickets'.",
      target: "my-tickets",
    },
    {
      title: "Traiter un ticket",
      description: "Ouvrez un ticket, ajoutez des commentaires, changez le statut (En cours, Résolu, Fermé).",
      target: "ticket-actions",
    },
    {
      title: "Base de connaissances",
      description: "Consultez les articles pour trouver des solutions rapides aux problèmes récurrents.",
      target: "kb-menu",
    },
    {
      title: "Notifications",
      description: "Restez informé des nouveaux tickets et messages via les notifications en temps réel.",
      target: "notifications",
    },
    {
      title: "Tout est prêt !",
      description: "Vous savez maintenant comment gérer vos tickets efficacement. Bonne résolution !",
    },
  ],
  DEMANDEUR: [
    {
      title: "Bienvenue sur TicketFlow !",
      description: "Créez et suivez vos demandes de support facilement. Laissez-moi vous montrer comment.",
    },
    {
      title: "Créer un ticket",
      description: "Cliquez sur 'Nouveau Ticket' pour soumettre une demande. Choisissez la catégorie et la priorité.",
      target: "new-ticket-button",
      action: "Créer un ticket",
    },
    {
      title: "Suivre vos tickets",
      description: "Consultez l'état de vos tickets dans 'Mes Tickets'. Vous recevrez des notifications à chaque mise à jour.",
      target: "my-tickets",
    },
    {
      title: "Ajouter des commentaires",
      description: "Communiquez avec les agents en ajoutant des messages dans vos tickets ouverts.",
      target: "ticket-messages",
    },
    {
      title: "Base de connaissances",
      description: "Trouvez des réponses rapides dans notre base de connaissances avant de créer un ticket.",
      target: "kb-menu",
    },
    {
      title: "C'est terminé !",
      description: "Vous savez maintenant comment utiliser TicketFlow. Besoin d'aide ? Créez un ticket !",
    },
  ],
}

export function OnboardingTutorial({ userRole, onComplete, onSkip }: OnboardingTutorialProps) {
  const steps = tutorialSteps[userRole] || tutorialSteps.DEMANDEUR
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pr-8">
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <CardDescription className="mt-2">
              Étape {currentStep + 1} sur {steps.length}
            </CardDescription>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">{step.description}</p>

          {step.action && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">
                💡 Action suggérée : {step.action}
              </p>
            </div>
          )}

          {step.target && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                🎯 Recherchez : <span className="font-mono font-semibold">{step.target}</span>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Passer le tutoriel
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
