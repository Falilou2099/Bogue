"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip,
  Send,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { Ticket } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface TicketHistory {
  id: string
  action: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [history, setHistory] = useState<TicketHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchTicket()
    fetchHistory()
    fetchCategories()
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTicket(data.ticket)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du ticket:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/history`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setHistory(data.history)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCategories(data.categories)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTicket(data.ticket)
          fetchHistory()
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTicket(data.ticket)
          fetchHistory()
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la priorité:", error)
    }
  }

  const handleCategoryChange = async (newCategoryId: string) => {
    if (!ticket) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: newCategoryId }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTicket(data.ticket)
          fetchHistory()
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error)
    }
  }

  const handleCloseTicket = async () => {
    if (!confirm("Voulez-vous clôturer ce ticket ?")) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FERME" }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTicket(data.ticket)
          fetchHistory()
        }
      }
    } catch (error) {
      console.error("Erreur lors de la clôture du ticket:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce ticket ?")) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/tickets")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })

      if (res.ok) {
        setComment("")
        fetchHistory()
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Ticket introuvable</h2>
          <p className="text-muted-foreground">Ce ticket n'existe pas ou a été supprimé.</p>
          <Button asChild>
            <Link href="/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux tickets
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER" || ticket.createdBy?.id === user?.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tickets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
              <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                {STATUS_LABELS[ticket.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ticket #{ticket.id} • Créé {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {ticket.status !== "FERME" && canEdit && (
            <Button variant="outline" size="sm" onClick={handleCloseTicket}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Clôturer
            </Button>
          )}
          {canEdit && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Historique et commentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun historique disponible
                </p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {item.user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.action === "CREATION" && "a créé le ticket"}
                        {item.action === "CHANGEMENT_STATUT" && `a changé le statut de "${item.oldValue}" à "${item.newValue}"`}
                        {item.action === "CHANGEMENT_PRIORITE" && `a changé la priorité de "${item.oldValue}" à "${item.newValue}"`}
                        {item.action === "ASSIGNATION" && `a assigné le ticket à ${item.newValue}`}
                        {item.action === "COMMENTAIRE" && item.newValue}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <Separator />

              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Joindre un fichier
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim() || isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select value={ticket.status} onValueChange={handleStatusChange} disabled={!canEdit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUVERT">Ouvert</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="RESOLU">Résolu</SelectItem>
                    <SelectItem value="FERME">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priorité</label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange} disabled={!canEdit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASSE">Basse</SelectItem>
                    <SelectItem value="MOYENNE">Moyenne</SelectItem>
                    <SelectItem value="HAUTE">Haute</SelectItem>
                    <SelectItem value="CRITIQUE">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select value={ticket.category?.id || ""} onValueChange={handleCategoryChange} disabled={!canEdit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Créé par:</span>
                  <span className="font-medium">{ticket.createdBy?.name}</span>
                </div>

                {ticket.assignedTo && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigné à:</span>
                    <span className="font-medium">{ticket.assignedTo.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Créé le:</span>
                  <span className="font-medium">
                    {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                {ticket.updatedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mis à jour:</span>
                    <span className="font-medium">
                      {new Date(ticket.updatedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
