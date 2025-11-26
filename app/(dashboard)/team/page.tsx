"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { mockUsers } from "@/lib/mock-data"
import { Search, Users, UserPlus, Mail, MoreHorizontal, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const teamMembers = mockUsers.filter((u) => u.role === "agent" || u.role === "manager")

const workloadData = teamMembers.map((member) => ({
  ...member,
  activeTickets: Math.floor(Math.random() * 15) + 1,
  resolvedToday: Math.floor(Math.random() * 8),
  avgResponseTime: `${Math.floor(Math.random() * 30) + 10}min`,
  satisfaction: Math.floor(Math.random() * 15) + 85,
  status: Math.random() > 0.2 ? "online" : "away",
}))

export default function TeamPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const canManage = user?.role === "admin" || user?.role === "manager"

  const filteredMembers = workloadData.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const onlineCount = workloadData.filter((m) => m.status === "online").length
  const totalActiveTickets = workloadData.reduce((sum, m) => sum + m.activeTickets, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-muted-foreground mt-1">Gérez votre équipe de support</p>
        </div>
        {canManage && (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un membre
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
                <p className="text-3xl font-bold">
                  {onlineCount}/{workloadData.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets en cours</p>
                <p className="text-3xl font-bold">{totalActiveTickets}</p>
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
                <p className="text-sm text-muted-foreground">Résolus aujourd'hui</p>
                <p className="text-3xl font-bold">{workloadData.reduce((sum, m) => sum + m.resolvedToday, 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction moyenne</p>
                <p className="text-3xl font-bold">
                  {Math.round(workloadData.reduce((sum, m) => sum + m.satisfaction, 0) / workloadData.length)}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Vue grille</TabsTrigger>
          <TabsTrigger value="workload">Charge de travail</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                            member.status === "online" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {member.role === "manager" ? "Manager" : "Agent"}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                        <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Voir les tickets</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{member.activeTickets}</p>
                      <p className="text-xs text-muted-foreground">En cours</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{member.resolvedToday}</p>
                      <p className="text-xs text-muted-foreground">Résolus</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{member.satisfaction}%</p>
                      <p className="text-xs text-muted-foreground">Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workload">
          <Card>
            <CardHeader>
              <CardTitle>Charge de travail par agent</CardTitle>
              <CardDescription>Répartition actuelle des tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredMembers.map((member) => {
                  const maxTickets = 15
                  const loadPercentage = (member.activeTickets / maxTickets) * 100
                  const isOverloaded = loadPercentage > 80

                  return (
                    <div key={member.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Temps de réponse moyen: {member.avgResponseTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverloaded && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">
                            {member.activeTickets}/{maxTickets} tickets
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={loadPercentage}
                        className={`h-2 ${isOverloaded ? "[&>div]:bg-yellow-500" : ""}`}
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
