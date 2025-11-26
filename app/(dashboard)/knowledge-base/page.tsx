"use client"

import { useState } from "react"
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
  Plus,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const categories = [
  { id: "getting-started", name: "Prise en main", icon: BookOpen, count: 12, color: "bg-blue-500" },
  { id: "account", name: "Compte & Facturation", icon: FileText, count: 8, color: "bg-green-500" },
  { id: "technical", name: "Support technique", icon: HelpCircle, count: 15, color: "bg-orange-500" },
  { id: "tutorials", name: "Tutoriels vidéo", icon: Video, count: 6, color: "bg-purple-500" },
]

const articles = [
  {
    id: "1",
    title: "Comment créer votre premier ticket",
    category: "getting-started",
    excerpt: "Apprenez à créer et suivre vos demandes de support en quelques étapes simples.",
    views: 1245,
    helpful: 89,
    notHelpful: 3,
    readTime: 5,
    updatedAt: "2025-01-15",
  },
  {
    id: "2",
    title: "Comprendre les niveaux de priorité",
    category: "getting-started",
    excerpt: "Découvrez comment les priorités sont attribuées et leur impact sur le temps de réponse.",
    views: 892,
    helpful: 67,
    notHelpful: 2,
    readTime: 3,
    updatedAt: "2025-01-10",
  },
  {
    id: "3",
    title: "Réinitialiser votre mot de passe",
    category: "account",
    excerpt: "Étapes pour récupérer l'accès à votre compte en cas d'oubli de mot de passe.",
    views: 2341,
    helpful: 156,
    notHelpful: 8,
    readTime: 2,
    updatedAt: "2025-01-18",
  },
  {
    id: "4",
    title: "Configuration de l'authentification 2FA",
    category: "account",
    excerpt: "Sécurisez votre compte avec l'authentification à deux facteurs.",
    views: 567,
    helpful: 45,
    notHelpful: 1,
    readTime: 4,
    updatedAt: "2025-01-12",
  },
  {
    id: "5",
    title: "Résoudre les problèmes de connexion",
    category: "technical",
    excerpt: "Solutions aux problèmes courants de connexion et d'accès à la plateforme.",
    views: 1876,
    helpful: 134,
    notHelpful: 12,
    readTime: 6,
    updatedAt: "2025-01-20",
  },
  {
    id: "6",
    title: "Guide d'utilisation du chat en temps réel",
    category: "tutorials",
    excerpt: "Tutoriel complet sur l'utilisation du système de chat pour communiquer avec le support.",
    views: 432,
    helpful: 38,
    notHelpful: 0,
    readTime: 8,
    updatedAt: "2025-01-08",
  },
]

const popularArticles = articles.sort((a, b) => b.views - a.views).slice(0, 5)

export default function KnowledgeBasePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const canManage = user?.role === "admin" || user?.role === "manager"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de connaissances</h1>
          <p className="text-muted-foreground mt-1">Trouvez des réponses à vos questions</p>
        </div>
        {canManage && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans la base de connaissances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
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
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.count} articles</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous les articles</TabsTrigger>
          <TabsTrigger value="popular">Les plus consultés</TabsTrigger>
          <TabsTrigger value="recent">Récents</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground">Essayez de modifier votre recherche</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{categories.find((c) => c.id === article.category)?.name}</Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min de lecture
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground">{article.excerpt}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views.toLocaleString()} vues
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            {article.helpful}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                            {article.notHelpful}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4">
            {popularArticles.map((article, index) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {articles
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold hover:text-primary transition-colors">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{article.excerpt}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
