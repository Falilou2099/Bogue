"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Clock, Ticket, AlertTriangle } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, PieChart, Pie, Cell } from "recharts"

interface AnalyticsData {
  ticketStats: {
    total: number
    ouvert: number
    enCours: number
    resolu: number
    ferme: number
  }
  priorityStats: {
    critique: number
    haute: number
    moyenne: number
    basse: number
  }
  categoryStats: Array<{
    name: string
    count: number
  }>
  dailyTickets: Array<{
    date: string
    count: number
  }>
  agentPerformance: Array<{
    name: string
    resolved: number
    avgTime: number
  }>
  avgResolutionTime: number
  satisfactionRate: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  const statusData = [
    { name: "Ouvert", value: data.ticketStats.ouvert, color: "#10b981" },
    { name: "En cours", value: data.ticketStats.enCours, color: "#3b82f6" },
    { name: "Résolu", value: data.ticketStats.resolu, color: "#a855f7" },
    { name: "Fermé", value: data.ticketStats.ferme, color: "#6b7280" },
  ]

  const priorityData = [
    { name: "Critique", value: data.priorityStats.critique, color: "#ef4444" },
    { name: "Haute", value: data.priorityStats.haute, color: "#f97316" },
    { name: "Moyenne", value: data.priorityStats.moyenne, color: "#eab308" },
    { name: "Basse", value: data.priorityStats.basse, color: "#22c55e" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Tableaux de bord et statistiques détaillées
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.ticketStats.total}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de résolution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">
              Temps moyen de résolution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.satisfactionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Basé sur les évaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets urgents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.priorityStats.critique}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention immédiate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Graphique des statuts */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
            <CardDescription>
              Distribution actuelle des tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique des priorités */}
        <Card>
          <CardHeader>
            <CardTitle>Priorités des tickets</CardTitle>
            <CardDescription>
              Distribution par niveau de priorité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Evolution temporelle */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des tickets</CardTitle>
          <CardDescription>
            Nombre de tickets créés par jour (7 derniers jours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyTickets}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                name="Tickets"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance des agents */}
      <Card>
        <CardHeader>
          <CardTitle>Performance des agents</CardTitle>
          <CardDescription>
            Tickets résolus et temps moyen de résolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.agentPerformance}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#10b981" name="Tickets résolus" />
              <Bar dataKey="avgTime" fill="#3b82f6" name="Temps moyen (h)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
