"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { Ticket } from "@/lib/types"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTickets(data.tickets)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    if (
      searchQuery &&
      !ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    if (activeTab === "open") return ticket.status === "OUVERT"
    if (activeTab === "in-progress") return ticket.status === "EN_COURS"
    if (activeTab === "pending") return ticket.status === "EN_ATTENTE"
    if (activeTab === "resolved") return ticket.status === "RESOLU" || ticket.status === "FERME"

    return true
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Gérez tous les tickets de support</p>
        </div>
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un ticket..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({tickets.length})</TabsTrigger>
          <TabsTrigger value="open">
            Ouverts ({tickets.filter((t) => t.status === "OUVERT").length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            En cours ({tickets.filter((t) => t.status === "EN_COURS").length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente ({tickets.filter((t) => t.status === "EN_ATTENTE").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Résolus ({tickets.filter((t) => t.status === "RESOLU" || t.status === "FERME").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Aucun ticket trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {ticket.id}
                          </span>
                          <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                            {PRIORITY_LABELS[ticket.priority]}
                          </Badge>
                          <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                            {STATUS_LABELS[ticket.status]}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 truncate">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Par {ticket.createdBy?.name}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                      {ticket.assignedTo && (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={ticket.assignedTo.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {ticket.assignedTo.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
