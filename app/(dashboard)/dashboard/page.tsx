"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Ticket, Clock, CheckCircle, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Filter } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { mockTickets, mockDashboardStats, mockAgentPerformance, mockChartData } from "@/lib/mock-data"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const isAdmin = hasRole(["admin", "manager"])

  const stats = [
    {
      title: "Tickets Ouverts",
      value: mockDashboardStats.ticketsOuverts,
      icon: Ticket,
      trend: "+12%",
      trendUp: false,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "En Cours",
      value: mockDashboardStats.ticketsEnCours,
      icon: Clock,
      trend: "-5%",
      trendUp: true,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Résolus ce mois",
      value: mockDashboardStats.ticketsResolus,
      icon: CheckCircle,
      trend: "+23%",
      trendUp: true,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Respect SLA",
      value: `${mockDashboardStats.tauxSlaRespect}%`,
      icon: TrendingUp,
      trend: "+2.1%",
      trendUp: true,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  const recentTickets = mockTickets.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour, {user?.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Voici un aperçu de votre activité aujourd'hui</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button size="sm" asChild>
            <Link href="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Charts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tickets par jour */}
          <Card>
            <CardHeader>
              <CardTitle>Activité des tickets</CardTitle>
              <CardDescription>Tickets ouverts vs résolus cette semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData.ticketsParJour}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="ouverts" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Ouverts" />
                    <Bar dataKey="resolus" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Résolus" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance SLA */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Performance SLA</CardTitle>
                <CardDescription>Tickets traités et taux de respect SLA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData.performanceEquipe}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mois" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[80, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="tickets"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        name="Tickets"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="sla"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        name="SLA %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Distribution par priorité */}
          <Card>
            <CardHeader>
              <CardTitle>Par priorité</CardTitle>
              <CardDescription>Distribution des tickets actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockChartData.ticketsParPriorite}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {mockChartData.ticketsParPriorite.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {mockChartData.ticketsParPriorite.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance des agents */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Performance agents</CardTitle>
                <CardDescription>Top performers ce mois</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAgentPerformance.map((agent) => (
                  <div key={agent.agentId} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={agent.agent?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {agent.agent?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.agent?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={agent.tauxSatisfaction} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{agent.tauxSatisfaction}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{agent.ticketsResolus}</p>
                      <p className="text-xs text-muted-foreground">résolus</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tickets récents</CardTitle>
            <CardDescription>Les derniers tickets créés ou mis à jour</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets">Voir tout</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{ticket.id}</span>
                    <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </Badge>
                    <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                      {STATUS_LABELS[ticket.status]}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Par {ticket.createdBy?.name} • {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {ticket.assignedTo && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.assignedTo.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {ticket.assignedTo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
