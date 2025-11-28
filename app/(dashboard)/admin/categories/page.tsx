"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { Ticket } from "@/lib/types"
import { FolderOpen, Ticket as TicketIcon, Plus, Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  description?: string
  _count?: {
    tickets: number
  }
  tickets?: Ticket[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?includeTickets=true")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCategories(data.categories)
          if (data.categories.length > 0) {
            setSelectedCategory(data.categories[0].id)
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) return

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories"
      const method = editingCategory ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setFormData({ name: "", description: "" })
        setEditingCategory(null)
        fetchCategories()
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || "" })
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ? Les tickets associés ne seront pas supprimés.")) return

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchCategories()
        if (selectedCategory === categoryId) {
          setSelectedCategory(null)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">Tickets regroupés par catégorie</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null)
              setFormData({ name: "", description: "" })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Modifiez les informations de la catégorie" : "Créez une nouvelle catégorie pour organiser vos tickets"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom</label>
                <Input
                  placeholder="Ex: Technique, Facturation..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Description de la catégorie (optionnel)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveCategory}>
                {editingCategory ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category._count?.tickets || 0} tickets
                  </p>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tickets for Selected Category */}
      {selectedCategoryData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Tickets - {selectedCategoryData.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCategoryData.tickets || selectedCategoryData.tickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun ticket dans cette catégorie</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCategoryData.tickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                {ticket.id}
                              </span>
                              <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>
                                {PRIORITY_LABELS[ticket.priority]}
                              </Badge>
                              <Badge variant="outline" className={STATUS_COLORS[ticket.status]}>
                                {STATUS_LABELS[ticket.status]}
                              </Badge>
                            </div>
                            <h3 className="font-semibold truncate">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Créé le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                              {ticket.createdBy && ` par ${ticket.createdBy.name}`}
                            </p>
                          </div>
                          {ticket.assignedTo && (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={ticket.assignedTo.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {ticket.assignedTo.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
