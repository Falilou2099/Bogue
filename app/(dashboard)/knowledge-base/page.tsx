"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Grid3x3,
  List,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  categoryId: string
  views: number
  helpful: number
  notHelpful: number
  updatedAt: string
  category?: {
    id: string
    name: string
    description?: string
  }
}

interface Category {
  id: string
  name: string
  description?: string
  icon: any
  count: number
  color: string
}

const categoryIcons: Record<string, any> = {
  "Technique": HelpCircle,
  "Facturation": FileText,
  "Commercial": BookOpen,
  "Support": HelpCircle,
  "Autre": FileText,
}

const categoryColors: Record<string, string> = {
  "Technique": "bg-blue-500",
  "Facturation": "bg-green-500",
  "Commercial": "bg-orange-500",
  "Support": "bg-purple-500",
  "Autre": "bg-gray-500",
}

export default function KnowledgeBasePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les articles
        const articlesRes = await fetch("/api/articles")
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json()
          if (articlesData.success) {
            setArticles(articlesData.articles)
          }
        }

        // Récupérer les catégories
        const categoriesRes = await fetch("/api/categories")
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          if (categoriesData.success) {
            const formattedCategories = categoriesData.categories.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              icon: categoryIcons[cat.name] || HelpCircle,
              count: cat._count?.articles || 0,
              color: categoryColors[cat.name] || "bg-gray-500",
            }))
            setCategories(formattedCategories)
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredArticles = articles.filter((article) => {
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedCategory && article.categoryId !== selectedCategory) {
      return false
    }
    return true
  })

  const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de connaissances</h1>
          <p className="text-muted-foreground mt-2">
            Trouvez des réponses à vos questions et apprenez à utiliser la plateforme
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "AGENT") && (
          <Button asChild>
            <Link href="/knowledge-base/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel article
            </Link>
          </Button>
        )}
      </div>

      {/* Search & View Toggle */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la base de connaissances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            <div className="flex gap-1 border rounded-lg p-1 bg-background">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${category.color}`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} articles</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous les articles</TabsTrigger>
          <TabsTrigger value="popular">Les plus consultés</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Aucun article trouvé</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <Link href={`/knowledge-base/${article.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category?.name || "Non catégorisé"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{article.excerpt || article.content.substring(0, 150) + "..."}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            {article.helpful}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </Link>
                      {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "AGENT") && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.preventDefault()
                              window.location.href = `/knowledge-base/${article.id}/edit`
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async (e) => {
                              e.preventDefault()
                              if (confirm("Voulez-vous vraiment supprimer cet article ?")) {
                                try {
                                  const res = await fetch(`/api/articles/${article.id}`, {
                                    method: "DELETE",
                                  })
                                  if (res.ok) {
                                    setArticles(articles.filter(a => a.id !== article.id))
                                  }
                                } catch (error) {
                                  console.error("Erreur lors de la suppression:", error)
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Link href={`/knowledge-base/${article.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {article.category?.name || "Non catégorisé"}
                          </Badge>
                          <h3 className="font-semibold hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views} vues
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            {article.helpful}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </Link>
                      {(user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "AGENT") && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              window.location.href = `/knowledge-base/${article.id}/edit`
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async (e) => {
                              e.preventDefault()
                              if (confirm("Voulez-vous vraiment supprimer cet article ?")) {
                                try {
                                  const res = await fetch(`/api/articles/${article.id}`, {
                                    method: "DELETE",
                                  })
                                  if (res.ok) {
                                    setArticles(articles.filter(a => a.id !== article.id))
                                  }
                                } catch (error) {
                                  console.error("Erreur lors de la suppression:", error)
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {popularArticles.map((article, index) => (
              <Link key={article.id} href={`/knowledge-base/${article.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.views.toLocaleString()} vues</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
