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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentType, setCommentType] = useState<"PUBLIC" | "INTERNE">("PUBLIC")
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)

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

  const handleCommentClick = () => {
    if (!comment.trim()) return
    setShowCommentModal(true)
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    setShowCommentModal(false)
    
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: comment,
          type: commentType,
        }),
      })

      if (res.ok) {
        setComment("")
        setCommentType("PUBLIC")
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

  const canEdit = user?.role?.toUpperCase() === "ADMIN" || user?.role?.toUpperCase() === "MANAGER" || user?.role?.toUpperCase() === "AGENT" || ticket.createdBy?.id === user?.id

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
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

      <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-12rem)] w-full">
        {/* Left Column - Content */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
          {/* Description */}
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Comments - Scrollable */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Historique et commentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun historique disponible
                </p>
              ) : (
                history.map((item) => {
                  const isInternalComment = item.action === "COMMENTAIRE" && item.newValue?.startsWith("[Interne]")
                  return (
                    <div 
                      key={item.id} 
                      className={`flex gap-3 p-3 rounded-lg ${isInternalComment ? 'bg-yellow-50 border-2 border-yellow-400 dark:bg-yellow-950 dark:border-yellow-600' : ''}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {item.user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.user.name}</span>
                          {isInternalComment && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-200">
                              Interne
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.action === "CREATION" && "a créé le ticket"}
                          {item.action === "CHANGEMENT_STATUT" && `a changé le statut de "${item.oldValue}" à "${item.newValue}"`}
                          {item.action === "CHANGEMENT_PRIORITE" && `a changé la priorité de "${item.oldValue}" à "${item.newValue}"`}
                          {item.action === "ASSIGNATION" && `a assigné le ticket à ${item.newValue}`}
                          {item.action === "COMMENTAIRE" && item.newValue?.replace("[Interne] ", "")}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              </div>

              <Separator className="flex-shrink-0 my-4" />

              {/* Add Comment */}
              <div className="space-y-3 flex-shrink-0">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Joindre un fichier
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleCommentClick}
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

        {/* Sidebar - Right side with full height */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-hidden">
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

          {/* Attachments Section */}
          <Card className="flex-shrink-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Pièces jointes
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAttachmentsModal(true)}
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Gérer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="space-y-2">
                  {ticket.attachments.slice(0, 3).map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{attachment.fileName}</span>
                      <span className="text-xs text-muted-foreground">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                  {ticket.attachments.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowAttachmentsModal(true)}
                    >
                      Voir tout ({ticket.attachments.length})
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune pièce jointe
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal des pièces jointes */}
      <Dialog open={showAttachmentsModal} onOpenChange={setShowAttachmentsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pièces jointes</DialogTitle>
            <DialogDescription>
              Consultez et gérez les fichiers attachés à ce ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Glissez-déposez vos fichiers ici ou
              </p>
              <Button variant="outline" size="sm">
                <Paperclip className="mr-2 h-4 w-4" />
                Parcourir
              </Button>
            </div>

            {/* Attachments List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ticket?.attachments && ticket.attachments.length > 0 ? (
                ticket.attachments.map((attachment: any) => (
                  <div 
                    key={attachment.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent"
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.fileSize / 1024).toFixed(1)} KB • {new Date(attachment.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Télécharger
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune pièce jointe pour le moment
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachmentsModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de choix du type de commentaire */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Type de commentaire</DialogTitle>
            <DialogDescription>
              Choisissez si ce commentaire est visible par le client ou interne à votre équipe.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={commentType} onValueChange={(value) => setCommentType(value as "PUBLIC" | "INTERNE")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PUBLIC" id="public" />
              <Label htmlFor="public" className="cursor-pointer">
                <div className="font-medium">Public</div>
                <div className="text-sm text-muted-foreground">Visible par le client et l'équipe</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="INTERNE" id="interne" />
              <Label htmlFor="interne" className="cursor-pointer">
                <div className="font-medium">Interne</div>
                <div className="text-sm text-muted-foreground">Visible uniquement par l'équipe (agents, managers, admins)</div>
              </Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCommentSubmit} disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
