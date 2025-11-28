"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Clock, AlertCircle, CheckCircle, Edit2, Plus, Save, X } from "lucide-react"
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { TicketPriority } from "@/lib/types"

interface SLA {
  id: string
  name: string
  priority: TicketPriority
  responseTime: number // en minutes
  resolutionTime: number // en minutes
  escalationEnabled: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    tickets: number
  }
}

export default function SLAPage() {
  const [slas, setSlas] = useState<SLA[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<SLA | null>(null)

  useEffect(() => {
    fetchSLAs()
  }, [])

  const fetchSLAs = async () => {
    try {
      const response = await fetch("/api/sla")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSlas(data.slas)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des SLAs:", error)
    }
  }

  const handleEdit = (sla: SLA) => {
    setEditingId(sla.id)
    setEditData({ ...sla })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleSave = async () => {
    if (!editData) return

    try {
      const response = await fetch(`/api/sla/${editData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSlas((prev) =>
            prev.map((sla) => (sla.id === editData.id ? data.sla : sla))
          )
          setEditingId(null)
          setEditData(null)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du SLA:", error)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des SLA</h1>
          <p className="text-muted-foreground mt-2">
            Configurez les accords de niveau de service
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau SLA
        </Button>
      </div>

      <div className="grid gap-4">
        {slas.map((sla) => {
          const isEditing = editingId === sla.id
          const currentData = isEditing ? editData! : sla

          return (
            <Card key={sla.id} className={isEditing ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>{currentData.name}</CardTitle>
                    <Badge
                      className={`${PRIORITY_COLORS[currentData.priority as TicketPriority]} text-white`}
                    >
                      {PRIORITY_LABELS[currentData.priority as TicketPriority]}
                    </Badge>
                    {currentData._count && (
                      <Badge variant="outline">
                        {currentData._count.tickets} tickets
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(sla)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Créé le {new Date(currentData.createdAt).toLocaleDateString("fr-FR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Temps de réponse</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editData!.responseTime}
                          onChange={(e) =>
                            setEditData({
                              ...editData!,
                              responseTime: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24"
                        />
                        <span className="text-sm">minutes</span>
                      </div>
                    ) : (
                      <p className="font-medium">{formatTime(currentData.responseTime)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>Temps de résolution</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editData!.resolutionTime}
                          onChange={(e) =>
                            setEditData({
                              ...editData!,
                              resolutionTime: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24"
                        />
                        <span className="text-sm">minutes</span>
                      </div>
                    ) : (
                      <p className="font-medium">{formatTime(currentData.resolutionTime)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Escalade automatique</span>
                    </div>
                    {isEditing ? (
                      <Switch
                        checked={editData!.escalationEnabled}
                        onCheckedChange={(checked) =>
                          setEditData({ ...editData!, escalationEnabled: checked })
                        }
                      />
                    ) : (
                      <Badge variant={currentData.escalationEnabled ? "default" : "secondary"}>
                        {currentData.escalationEnabled ? "Activée" : "Désactivée"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
