"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Send,
  Clock,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  History,
  Lock,
  Eye,
} from "lucide-react"
import { mockTickets, mockTicketMessages, mockTicketHistory } from "@/lib/mock-data"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, TYPE_LABELS } from "@/lib/constants"
import type { TicketStatus } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function TicketDetailPage() {
  const params = useParams()
  const { user, hasRole } = useAuth()
  const [message, setMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)

  const ticket = mockTickets.find((t) => t.id === params.id)
  const messages = mockTicketMessages.filter((m) => m.ticketId === params.id)
  const history = mockTicketHistory.filter((h) => h.ticketId === params.id)

  const canManage = hasRole(["agent", "manager", "admin"])
  const canSeeInternal = hasRole(["agent", "manager", "admin"])

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Ticket non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/tickets">Retour aux tickets</Link>
        </Button>
      </div>
    )
  }

  const handleSendMessage = () => {
    if (!message.trim()) return
    // Handle message sending
    setMessage("")
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "À l'instant"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `Il y a ${days}j`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/tickets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">{ticket.id}</span>
              <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                {STATUS_LABELS[ticket.status]}
              </Badge>
              <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
              <Badge variant="secondary">{TYPE_LABELS[ticket.type]}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
            <p className="text-muted-foreground mt-1">
              Créé par {ticket.createdBy?.name} le{" "}
              {new Date(ticket.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/tickets/${ticket.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Dupliquer</DropdownMenuItem>
              <DropdownMenuItem>Exporter PDF</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
              {ticket.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {ticket.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation & History Tabs */}
          <Card>
            <Tabs defaultValue="conversation">
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="conversation" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Conversation
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    Historique
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="conversation" className="mt-0">
                <CardContent className="pt-6">
                  {/* Messages */}
                  <div className="space-y-4 mb-6">
                    {messages
                      .filter((m) => canSeeInternal || m.type === "public")
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-3",
                            msg.type === "interne" &&
                              "bg-yellow-500/5 -mx-4 px-4 py-3 rounded-lg border-l-2 border-yellow-500",
                          )}
                        >
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={msg.sender?.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {msg.sender?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{msg.sender?.name}</span>
                              {msg.type === "interne" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  Note interne
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{getTimeAgo(msg.createdAt)}</span>
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Reply Box */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Écrivez votre réponse..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        {canSeeInternal && (
                          <Button
                            variant={isInternal ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setIsInternal(!isInternal)}
                            className="gap-1"
                          >
                            <Lock className="h-3 w-3" />
                            Note interne
                          </Button>
                        )}
                      </div>
                      <Button onClick={handleSendMessage} disabled={!message.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {history.map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <History className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {index < history.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm">
                            <span className="font-medium">{event.user?.name}</span> {event.action}
                            {event.oldValue && event.newValue && (
                              <span className="text-muted-foreground">
                                {" "}
                                de{" "}
                                <Badge variant="outline" className="mx-1">
                                  {event.oldValue}
                                </Badge>
                                à{" "}
                                <Badge variant="outline" className="mx-1">
                                  {event.newValue}
                                </Badge>
                              </span>
                            )}
                            {!event.oldValue && event.newValue && (
                              <span className="text-muted-foreground">
                                {" "}
                                à{" "}
                                <Badge variant="outline" className="mx-1">
                                  {event.newValue}
                                </Badge>
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Statut</label>
                {canManage ? (
                  <Select defaultValue={ticket.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Assigné à</label>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ticket.assignedTo.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {ticket.assignedTo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{ticket.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{ticket.assignedTo.role}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Non assigné</p>
                )}
                {canManage && (
                  <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                    <User className="mr-2 h-4 w-4" />
                    {ticket.assignedTo ? "Réassigner" : "Assigner"}
                  </Button>
                )}
              </div>

              <Separator />

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                <p className="text-sm">{ticket.category?.name || "Non catégorisé"}</p>
              </div>

              <Separator />

              {/* Time Tracking */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Temps passé</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.timeSpent} minutes</span>
                </div>
              </div>

              {/* SLA */}
              {ticket.dueDate && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Échéance SLA</label>
                    <p className="text-sm">
                      {new Date(ticket.dueDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demandeur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={ticket.createdBy?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {ticket.createdBy?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ticket.createdBy?.name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.createdBy?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                Voir le profil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
