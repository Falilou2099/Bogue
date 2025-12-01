"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants"
import type { Ticket } from "@/lib/types"

export function UnassignedTicketsBanner() {
  const { user, hasRole } = useAuth()
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Seuls les agents et managers peuvent voir cette bannière
  const canAssignTickets = hasRole(["agent", "manager", "admin"])

  useEffect(() => {
    if (canAssignTickets) {
      fetchUnassignedTickets()
    }
  }, [canAssignTickets])

  const fetchUnassignedTickets = async () => {
    try {
      const res = await fetch("/api/tickets?unassigned=true")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUnassignedTickets(data.tickets)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tickets non assignés:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignToMe = async (ticketId: string) => {
    if (!user) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: user.id }),
      })

      if (res.ok) {
        // Retirer le ticket de la liste
        setUnassignedTickets(prev => prev.filter(t => t.id !== ticketId))
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du ticket:", error)
    }
  }

  // Ne rien afficher si pas de permission ou pas de tickets
  if (!canAssignTickets || isLoading || unassignedTickets.length === 0) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-orange-900 dark:text-orange-100">
            Nouveaux tickets en attente
          </CardTitle>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {unassignedTickets.length} ticket{unassignedTickets.length > 1 ? "s" : ""} sans responsable
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {unassignedTickets.slice(0, 3).map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white dark:bg-gray-900 border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {ticket.id}
                  </span>
                  <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                </div>
                <Link href={`/tickets/${ticket.id}`}>
                  <p className="text-sm font-medium hover:underline truncate">
                    {ticket.title}
                  </p>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Par {ticket.createdBy?.name} • {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAssignToMe(ticket.id)}
                className="shrink-0"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Me l'assigner
              </Button>
            </div>
          ))}
          {unassignedTickets.length > 3 && (
            <Link href="/tickets?filter=unassigned">
              <Button variant="outline" className="w-full">
                Voir tous les tickets non assignés ({unassignedTickets.length})
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
