"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Activity, User, Calendar, FileText, Filter, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface AuditLog {
  id: string
  ticketId: string
  userId: string
  action: string
  oldValue?: string
  newValue?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
  }
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [filters, setFilters] = useState({
    userId: "all",
    action: "all",
    ticketId: "",
  })

  useEffect(() => {
    fetchUsers()
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    fetchAuditLogs()
  }, [filters])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAllUsers(data.users)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId)
      if (filters.action && filters.action !== "all") params.append("action", filters.action)
      if (filters.ticketId) params.append("ticketId", filters.ticketId)

      const response = await fetch(`/api/audit?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLogs(data.logs)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error)
    }
  }

  const clearFilters = () => {
    setFilters({
      userId: "all",
      action: "all",
      ticketId: "",
    })
  }

  const hasActiveFilters = (filters.userId !== "all") || (filters.action !== "all") || filters.ticketId

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATION: "Création",
      CHANGEMENT_STATUT: "Changement de statut",
      ASSIGNATION: "Assignation",
      CHANGEMENT_PRIORITE: "Changement de priorité",
      COMMENTAIRE: "Commentaire ajouté",
      FERMETURE: "Fermeture",
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATION: "bg-green-500",
      CHANGEMENT_STATUT: "bg-blue-500",
      ASSIGNATION: "bg-purple-500",
      CHANGEMENT_PRIORITE: "bg-orange-500",
      COMMENTAIRE: "bg-gray-500",
      FERMETURE: "bg-red-500",
    }
    return colors[action] || "bg-gray-400"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs d'audit</h1>
        <p className="text-muted-foreground mt-2">
          Historique de toutes les actions effectuées sur les tickets
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              Dernières 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.action === "CREATION").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nouveaux tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignations</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.action === "ASSIGNATION").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tickets assignés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fermetures</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => l.action === "FERMETURE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tickets fermés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historique détaillé</CardTitle>
              <CardDescription>
                Liste chronologique de toutes les actions
              </CardDescription>
            </div>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Utilisateur</label>
              <Select
                value={filters.userId}
                onValueChange={(value) => setFilters({ ...filters, userId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les utilisateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  {allUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters({ ...filters, action: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="CREATION">Création</SelectItem>
                  <SelectItem value="CHANGEMENT_STATUT">Changement de statut</SelectItem>
                  <SelectItem value="ASSIGNATION">Assignation</SelectItem>
                  <SelectItem value="CHANGEMENT_PRIORITE">Changement de priorité</SelectItem>
                  <SelectItem value="COMMENTAIRE">Commentaire</SelectItem>
                  <SelectItem value="FERMETURE">Fermeture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ticket ID</label>
              <Input
                placeholder="Ex: TKT-001"
                value={filters.ticketId}
                onChange={(e) => setFilters({ ...filters, ticketId: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 rounded-lg border">
                  <div className={`w-2 rounded-full ${getActionColor(log.action)}`} />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={log.user.avatar} />
                    <AvatarFallback>
                      {log.user.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{log.user.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {getActionLabel(log.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Ticket #{log.ticketId}
                      </span>
                    </div>
                    {log.oldValue && log.newValue && (
                      <p className="text-sm text-muted-foreground">
                        {log.oldValue} → {log.newValue}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
