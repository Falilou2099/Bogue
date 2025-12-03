"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NewArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    published: true,
  })

  const [categories, setCategories] = useState<any[]>([])

  // Charger les catégories
  useState(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories)
        }
      })
      .catch(console.error)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !formData.categoryId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Article créé avec succès",
        })
        router.push(`/knowledge-base/${data.article.id}`)
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/knowledge-base">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nouvel article</h1>
            <p className="text-muted-foreground mt-1">
              Créer un nouvel article pour la base de connaissances
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {preview ? "Éditer" : "Aperçu"}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Création..." : "Créer l'article"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Comment réinitialiser son mot de passe"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  placeholder="Rédigez le contenu de l'article. Vous pouvez utiliser le format Markdown."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Supporte le format Markdown (# Titre, **gras**, *italique*, - liste, etc.)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h1>{formData.title || "Titre de l'article"}</h1>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content
                        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/^- (.+)$/gm, '<li>$1</li>')
                        .replace(/\n/g, '<br>')
                        || "Le contenu de l'article apparaîtra ici..." 
                    }} 
                  />
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  Cliquez sur "Aperçu" pour voir le rendu de l'article
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils de rédaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Utilisez des titres clairs et descriptifs</p>
              <p>• Structurez le contenu avec des sections</p>
              <p>• Ajoutez des exemples concrets</p>
              <p>• Utilisez des listes pour les étapes</p>
              <p>• Restez concis et précis</p>
              <p>• Relisez avant de publier</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
