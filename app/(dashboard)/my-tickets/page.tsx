"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { useAuth } from "@/lib/auth-context"
import { mockTickets } from "@/lib/mock-data"
import { Plus, Search, Clock, MessageSquare, Paperclip, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export default function MyTicketsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const myTickets = mockTickets.filter((t) => t.requesterId === user?.id)

  const filteredTickets = myTickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openTickets = filteredTickets.filter((t) => t.status === "open" || t.status === "in_progress")
  const pendingTickets = filteredTickets.filter((t) => t.status === "pending")
  const resolvedTickets = filteredTickets.filter((t) => t.status === "resolved" || t.status === "closed")

  const TicketCard = ({ ticket }: { ticket: (typeof mockTickets)[0] }) => (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <h3 className="font-medium truncate">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: fr })}
                </span>
                {ticket.messages && ticket.messages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.messages.length} messages
                  </span>
                )}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {ticket.attachments.length} fichiers
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes tickets</h1>
          <p className="text-muted-foreground mt-1">Suivez vos demandes de support</p>
        </div>
        <Link href="/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-3xl font-bold">{openTickets.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-3xl font-bold">{pendingTickets.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-3xl font-bold">{resolvedTickets.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un ticket..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">
            En cours
            {openTickets.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {openTickets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente
            {pendingTickets.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingTickets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Résolus</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Aucun ticket en cours</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas de ticket ouvert actuellement</p>
                <Link href="/tickets/new">
                  <Button>Créer un ticket</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            openTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">Aucun ticket en attente</h3>
              </CardContent>
            </Card>
          ) : (
            pendingTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">Aucun ticket résolu</h3>
              </CardContent>
            </Card>
          ) : (
            resolvedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">Aucun ticket trouvé</h3>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
