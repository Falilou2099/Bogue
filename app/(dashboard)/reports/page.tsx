"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Award,
  PieChart,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const performanceData = [
  { agent: "Marie Dupont", resolved: 156, avgTime: "2h 15min", satisfaction: 98, sla: 99 },
  { agent: "Pierre Martin", resolved: 142, avgTime: "2h 45min", satisfaction: 95, sla: 97 },
  { agent: "Sophie Bernard", resolved: 128, avgTime: "3h 10min", satisfaction: 92, sla: 94 },
  { agent: "Lucas Petit", resolved: 118, avgTime: "3h 30min", satisfaction: 90, sla: 92 },
]

const categoryStats = [
  { category: "Technique", count: 245, percentage: 35, trend: 12 },
  { category: "Facturation", count: 168, percentage: 24, trend: -5 },
  { category: "Commercial", count: 140, percentage: 20, trend: 8 },
  { category: "Autre", count: 147, percentage: 21, trend: 2 },
]

const slaMetrics = [
  { priority: "Critique", target: "1h", actual: "45min", compliance: 98 },
  { priority: "Haute", target: "4h", actual: "3h 20min", compliance: 95 },
  { priority: "Moyenne", target: "8h", actual: "6h 45min", compliance: 92 },
  { priority: "Basse", target: "24h", actual: "18h", compliance: 97 },
]

export default function ReportsPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState("month")

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p className="text-muted-foreground">Cette page est réservée aux managers et administrateurs.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground mt-1">Analysez les performances de votre équipe</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets résolus</p>
                <p className="text-3xl font-bold">1,248</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +12% vs mois dernier
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps moyen de résolution</p>
                <p className="text-3xl font-bold">2h 45m</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  -8% vs mois dernier
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de satisfaction</p>
                <p className="text-3xl font-bold">94%</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +3% vs mois dernier
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformité SLA</p>
                <p className="text-3xl font-bold">96%</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  -1% vs mois dernier
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance agents</TabsTrigger>
          <TabsTrigger value="categories">Par catégorie</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance des agents
              </CardTitle>
              <CardDescription>Classement basé sur les tickets résolus ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((agent, index) => (
                  <div key={agent.agent} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{agent.agent}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{agent.resolved} tickets résolus</span>
                        <span>Temps moyen: {agent.avgTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{agent.satisfaction}%</p>
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{agent.sla}%</p>
                        <p className="text-xs text-muted-foreground">SLA</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Répartition par catégorie
              </CardTitle>
              <CardDescription>Distribution des tickets par type de demande</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categoryStats.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.category}</span>
                        <Badge variant="secondary">{cat.count} tickets</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{cat.percentage}%</span>
                        {cat.trend > 0 ? (
                          <span className="flex items-center text-xs text-green-600">
                            <TrendingUp className="h-3 w-3 mr-1" />+{cat.trend}%
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-red-600">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {cat.trend}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conformité SLA par priorité
              </CardTitle>
              <CardDescription>Respect des temps de réponse cibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slaMetrics.map((sla) => (
                  <div key={sla.priority} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Badge
                          variant="secondary"
                          className={
                            sla.priority === "Critique"
                              ? "bg-red-100 text-red-700"
                              : sla.priority === "Haute"
                                ? "bg-orange-100 text-orange-700"
                                : sla.priority === "Moyenne"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                          }
                        >
                          {sla.priority}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{sla.compliance}%</span>
                        <p className="text-xs text-muted-foreground">de conformité</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Objectif</p>
                        <p className="font-medium">{sla.target}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temps réel moyen</p>
                        <p className="font-medium">{sla.actual}</p>
                      </div>
                    </div>
                    <Progress value={sla.compliance} className="h-2 mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendances des tickets
              </CardTitle>
              <CardDescription>Evolution sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[
                  { month: "Août", created: 180, resolved: 165 },
                  { month: "Sept", created: 220, resolved: 210 },
                  { month: "Oct", created: 195, resolved: 200 },
                  { month: "Nov", created: 240, resolved: 235 },
                  { month: "Déc", created: 210, resolved: 220 },
                  { month: "Jan", created: 250, resolved: 248 },
                ].map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end justify-center h-48">
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{ height: `${(data.created / 250) * 100}%` }}
                        title={`Créés: ${data.created}`}
                      />
                      <div
                        className="w-6 bg-green-500 rounded-t"
                        style={{ height: `${(data.resolved / 250) * 100}%` }}
                        title={`Résolus: ${data.resolved}`}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Tickets créés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500" />
                  <span className="text-sm text-muted-foreground">Tickets résolus</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
