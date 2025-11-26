"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  Trash2,
  ArrowUpDown,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { mockTickets } from "@/lib/mock-data"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, TYPE_LABELS } from "@/lib/constants"
import type { TicketStatus, TicketPriority } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function TicketsPage() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredTickets = mockTickets.filter((ticket) => {
    if (
      searchQuery &&
      !ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    if (statusFilter.length > 0 && !statusFilter.includes(ticket.status)) {
      return false
    }
    if (priorityFilter.length > 0 && !priorityFilter.includes(ticket.priority)) {
      return false
    }
    if (activeTab === "open" && !["ouvert", "en_cours", "en_attente"].includes(ticket.status)) {
      return false
    }
    if (activeTab === "resolved" && !["resolu", "ferme"].includes(ticket.status)) {
      return false
    }
    return true
  })

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  const toggleAllTickets = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredTickets.map((t) => t.id))
    }
  }

  const getDueDateStatus = (dueDate?: Date) => {
    if (!dueDate) return null
    const now = new Date()
    const due = new Date(dueDate)
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) return "overdue"
    if (diffHours < 4) return "urgent"
    if (diffHours < 24) return "soon"
    return "ok"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Gérez et suivez tous vos tickets de support</p>
        </div>
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="open">Ouverts</TabsTrigger>
                <TabsTrigger value="resolved">Résolus</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filter Dropdowns */}
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Statut
                    {statusFilter.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {statusFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status])
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== status))
                        }
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Priorité
                    {priorityFilter.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {priorityFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={priorityFilter.includes(priority)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPriorityFilter([...priorityFilter, priority])
                        } else {
                          setPriorityFilter(priorityFilter.filter((p) => p !== priority))
                        }
                      }}
                    >
                      {PRIORITY_LABELS[priority]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm">
              <strong>{selectedTickets.length}</strong> ticket(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Assigner
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Modifier statut
              </Button>
              <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                onCheckedChange={toggleAllTickets}
              />
            </div>
            <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-foreground">
              Ticket <ArrowUpDown className="h-3 w-3" />
            </div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-1">Priorité</div>
            <div className="col-span-2">Assigné à</div>
            <div className="col-span-1">SLA</div>
            <div className="col-span-1"></div>
          </div>

          {/* Ticket Rows */}
          <div className="divide-y">
            {filteredTickets.map((ticket) => {
              const dueDateStatus = getDueDateStatus(ticket.dueDate)
              return (
                <div
                  key={ticket.id}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors",
                    selectedTickets.includes(ticket.id) && "bg-primary/5",
                  )}
                >
                  {/* Checkbox */}
                  <div className="hidden md:flex col-span-1 items-center">
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={() => toggleTicketSelection(ticket.id)}
                    />
                  </div>

                  {/* Ticket Info */}
                  <div className="col-span-1 md:col-span-4">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">{ticket.id}</span>
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABELS[ticket.type]}
                        </Badge>
                      </div>
                      <p className="font-medium hover:text-primary transition-colors line-clamp-1">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Par {ticket.createdBy?.name} • {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </Link>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                      {STATUS_LABELS[ticket.status]}
                    </Badge>
                  </div>

                  {/* Priority */}
                  <div className="col-span-1 md:col-span-1 flex items-center">
                    <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </Badge>
                  </div>

                  {/* Assigned To */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={ticket.assignedTo.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {ticket.assignedTo.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{ticket.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Non assigné</span>
                    )}
                  </div>

                  {/* SLA */}
                  <div className="col-span-1 md:col-span-1 flex items-center">
                    {ticket.dueDate && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          dueDateStatus === "overdue" && "text-destructive",
                          dueDateStatus === "urgent" && "text-orange-500",
                          dueDateStatus === "soon" && "text-yellow-500",
                          dueDateStatus === "ok" && "text-muted-foreground",
                        )}
                      >
                        {dueDateStatus === "overdue" || dueDateStatus === "urgent" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {new Date(ticket.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tickets/${ticket.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/tickets/${ticket.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assigner
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTickets.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Aucun ticket trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
