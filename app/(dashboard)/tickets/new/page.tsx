"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Upload, X, Paperclip } from "lucide-react"
import { mockCategories, mockUsers } from "@/lib/mock-data"
import { PRIORITY_LABELS, TYPE_LABELS } from "@/lib/constants"
import type { TicketPriority, TicketType } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

export default function NewTicketPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])

  const canAssign = hasRole(["agent", "manager", "admin"])
  const agents = mockUsers.filter((u) => u.role === "agent" || u.role === "manager")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/tickets")
  }

  const handleFileUpload = () => {
    // Simulate file upload
    setAttachments([...attachments, `fichier-${attachments.length + 1}.pdf`])
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau ticket</h1>
          <p className="text-muted-foreground">Créez un nouveau ticket de support</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du ticket</CardTitle>
            <CardDescription>Décrivez votre problème ou demande en détail</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input id="title" placeholder="Décrivez brièvement votre problème" required />
            </div>

            {/* Type & Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select defaultValue="incident">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as TicketType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité *</Label>
                <Select defaultValue="moyenne">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assign (only for agents/managers/admins) */}
            {canAssign && (
              <div className="space-y-2">
                <Label htmlFor="assignee">Assigner à</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un agent (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre problème en détail. Incluez les étapes pour reproduire le problème, les messages d'erreur, etc."
                className="min-h-[150px]"
                required
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="Entrez des tags séparés par des virgules" />
              <p className="text-xs text-muted-foreground">Exemple: urgent, api, facturation</p>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Pièces jointes</Label>
              <div className="border border-dashed rounded-lg p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Glissez-déposez vos fichiers ici ou</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleFileUpload}>
                    <Paperclip className="mr-2 h-4 w-4" />
                    Parcourir
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG, PDF jusqu'à 10MB</p>
                </div>
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1">
                      <Paperclip className="h-3 w-3" />
                      {file}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="ml-1 hover:bg-muted rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/tickets">Annuler</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le ticket
          </Button>
        </div>
      </form>
    </div>
  )
}
