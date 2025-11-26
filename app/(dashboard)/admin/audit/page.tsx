"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, User, Ticket, Settings, Shield, LogIn } from "lucide-react"
import { mockUsers } from "@/lib/mock-data"

interface AuditLog {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress: string
  timestamp: Date
  type: "auth" | "ticket" | "user" | "settings" | "security"
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    userName: "Sophie Martin",
    userAvatar: mockUsers[0].avatar,
    action: "Connexion réussie",
    resource: "Authentification",
    ipAddress: "192.168.1.100",
    timestamp: new Date(Date.now() - 300000),
    type: "auth",
  },
  {
    id: "log-2",
    userId: "user-3",
    userName: "Marie Leroy",
    userAvatar: mockUsers[2].avatar,
    action: "Ticket modifié",
    resource: "Ticket",
    resourceId: "TKT-001",
    details: "Statut changé de 'Ouvert' à 'En cours'",
    ipAddress: "192.168.1.101",
    timestamp: new Date(Date.now() - 600000),
    type: "ticket",
  },
  {
    id: "log-3",
    userId: "user-1",
    userName: "Sophie Martin",
    userAvatar: mockUsers[0].avatar,
    action: "Utilisateur créé",
    resource: "Utilisateur",
    resourceId: "user-7",
    details: "Nouveau compte agent créé",
    ipAddress: "192.168.1.100",
    timestamp: new Date(Date.now() - 1200000),
    type: "user",
  },
  {
    id: "log-4",
    userId: "user-2",
    userName: "Pierre Dubois",
    userAvatar: mockUsers[1].avatar,
    action: "SLA modifié",
    resource: "Paramètres",
    resourceId: "sla-1",
    details: "Temps de réponse modifié de 30min à 45min",
    ipAddress: "192.168.1.102",
    timestamp: new Date(Date.now() - 3600000),
    type: "settings",
  },
  {
    id: "log-5",
    userId: "user-1",
    userName: "Sophie Martin",
    userAvatar: mockUsers[0].avatar,
    action: "2FA activé",
    resource: "Sécurité",
    resourceId: "user-4",
    details: "Double authentification activée pour Lucas Bernard",
    ipAddress: "192.168.1.100",
    timestamp: new Date(Date.now() - 7200000),
    type: "security",
  },
  {
    id: "log-6",
    userId: "user-5",
    userName: "Emma Petit",
    userAvatar: mockUsers[4].avatar,
    action: "Ticket créé",
    resource: "Ticket",
    resourceId: "TKT-003",
    details: "Nouveau ticket critique créé",
    ipAddress: "192.168.1.200",
    timestamp: new Date(Date.now() - 10800000),
    type: "ticket",
  },
  {
    id: "log-7",
    userId: "user-3",
    userName: "Marie Leroy",
    userAvatar: mockUsers[2].avatar,
    action: "Déconnexion",
    resource: "Authentification",
    ipAddress: "192.168.1.101",
    timestamp: new Date(Date.now() - 14400000),
    type: "auth",
  },
]

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredLogs = mockAuditLogs.filter((log) => {
    if (
      searchQuery &&
      !log.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.resourceId?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    if (typeFilter !== "all" && log.type !== typeFilter) {
      return false
    }
    return true
  })

  const getTypeIcon = (type: AuditLog["type"]) => {
    switch (type) {
      case "auth":
        return LogIn
      case "ticket":
        return Ticket
      case "user":
        return User
      case "settings":
        return Settings
      case "security":
        return Shield
    }
  }

  const getTypeBadge = (type: AuditLog["type"]) => {
    switch (type) {
      case "auth":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "ticket":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "user":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "settings":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "security":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal d'audit</h1>
          <p className="text-muted-foreground">Suivez toutes les actions effectuées dans le système</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur, action ou ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="auth">Authentification</SelectItem>
                <SelectItem value="ticket">Tickets</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
                <SelectItem value="settings">Paramètres</SelectItem>
                <SelectItem value="security">Sécurité</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>{filteredLogs.length} événements trouvés</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredLogs.map((log, index) => {
                const Icon = getTypeIcon(log.type)
                return (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${getTypeBadge(log.type)}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < filteredLogs.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={log.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {log.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{log.userName}</span>{" "}
                              <span className="text-muted-foreground">{log.action.toLowerCase()}</span>
                              {log.resourceId && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {log.resourceId}
                                </Badge>
                              )}
                            </p>
                            {log.details && <p className="text-sm text-muted-foreground mt-0.5">{log.details}</p>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{getTimeAgo(log.timestamp)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{log.ipAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
