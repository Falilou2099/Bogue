"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter, X, Grid3x3, List } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { Ticket } from "@/lib/types"

export default function TicketsPage() {
  const { user, hasRole } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("tous")
  // Par défaut, les agents/managers voient leurs responsabilités
  const defaultViewMode = hasRole(["agent", "manager", "admin"]) ? "assigned" : "my"
  const [viewMode, setViewMode] = useState<"all" | "my" | "assigned">(defaultViewMode)
  const [showFilters, setShowFilters] = useState(false)
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState({
    priority: "all",
    category: "all",
    assignedTo: "all",
  })

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTickets(data.tickets)
        }
      })
      .catch(() => {})
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    // Filtre par mode de vue
    if (viewMode === "my" && ticket.createdBy?.id !== user?.id) {
      return false
    }
    
    // Filtre "Mes responsabilités" - tickets assignés à l'utilisateur
    if (viewMode === "assigned" && ticket.assignedTo?.id !== user?.id) {
      return false
    }
    
    // Recherche
    if (
      searchQuery &&
      !ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filtre par statut (onglets)
    if (activeTab !== "tous") {
      if (activeTab === "OUVERT" && ticket.status !== "OUVERT") return false
      if (activeTab === "EN_COURS" && ticket.status !== "EN_COURS") return false
      if (activeTab === "EN_ATTENTE" && ticket.status !== "EN_ATTENTE") return false
      if (activeTab === "RESOLU" && ticket.status !== "RESOLU") return false
      if (activeTab === "FERME" && ticket.status !== "FERME") return false
    }

    // Filtre par priorité
    if (filters.priority !== "all" && ticket.priority !== filters.priority) {
      return false
    }

    // Filtre par catégorie
    if (filters.category !== "all" && ticket.category?.id !== filters.category) {
      return false
    }

    // Filtre par assigné
    if (filters.assignedTo !== "all") {
      if (filters.assignedTo === "unassigned" && ticket.assignedTo) return false
      if (filters.assignedTo !== "unassigned" && ticket.assignedTo?.id !== filters.assignedTo) return false
    }

    return true
  })

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Gérez tous les tickets de support</p>
        </div>
        <Button size="sm" asChild data-tutorial="create-ticket">
              >
                Tous les tickets
              </Button>
              <Button
                variant={viewMode === "my" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("my")}
              >
                Mes tickets
              </Button>
              {hasRole(["agent", "manager", "admin"]) && (
                <Button
                  variant={viewMode === "assigned" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("assigned")}
                >
                  Mes responsabilités
                </Button>
              )}
            </div>
          </div>
          <Link href="/tickets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau ticket
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="OUVERT">
              <div className="flex items-center gap-2">
                {STATUS_LABELS["OUVERT"]}
                <Badge variant="secondary" className="ml-1">
                  {tickets.filter((t) => t.status === "OUVERT").length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="EN_COURS">
              <div className="flex items-center gap-2">
                {STATUS_LABELS["EN_COURS"]}
                <Badge variant="secondary" className="ml-1">
                  {tickets.filter((t) => t.status === "EN_COURS").length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="EN_ATTENTE">
              <div className="flex items-center gap-2">
                {STATUS_LABELS["EN_ATTENTE"]}
                <Badge variant="secondary" className="ml-1">
                  {tickets.filter((t) => t.status === "EN_ATTENTE").length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="RESOLU">
              <div className="flex items-center gap-2">
                {STATUS_LABELS["RESOLU"]}
                <Badge variant="secondary" className="ml-1">
                  {tickets.filter((t) => t.status === "RESOLU").length}
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Aucun ticket trouvé</p>
              </CardContent>
            </Card>
          ) : displayMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {ticket.id}
                          </span>
                          <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                            {PRIORITY_LABELS[ticket.priority]}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-base line-clamp-2">{ticket.title}</h3>
                        <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                          {STATUS_LABELS[ticket.status]}
                        </Badge>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t">
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                          {ticket.assignedTo && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={ticket.assignedTo.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {ticket.assignedTo.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {ticket.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
                            {ticket.assignedTo && (
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
                                <span className="text-sm">{ticket.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
