"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Calendar,
  User,
} from "lucide-react"
import type { Article } from "@/lib/types"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState<'helpful' | 'notHelpful' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    if (params.id) {
      // Incrémenter le nombre de vues
      fetch(`/api/articles/${params.id}/view`, { method: 'POST' })
        .catch(() => {})

      // Charger l'article
      fetch(`/api/articles/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setArticle(data.article)
          } else {
            setError(data.error || "Article non trouvé")
          }
        })
        .catch(() => {
          setError("Erreur lors du chargement de l'article")
        })
    }
  }, [params.id])

  const handleVote = async (type: 'helpful' | 'notHelpful') => {
    if (hasVoted || isVoting || !article) return

    setIsVoting(true)
    try {
      const res = await fetch(`/api/articles/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setArticle(data.article)
          setHasVoted(type)
        }
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  if (error || !article) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Article non trouvé</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/knowledge-base")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la base de connaissances
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/knowledge-base")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{article.title}</h1>
        </div>
      </div>

      {/* Métadonnées de l'article */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.category && (
              <Badge variant="secondary">{article.category.name}</Badge>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.views.toLocaleString()} vues</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Mis à jour le{" "}
                {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Auteur */}
          {article.author && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {article.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Par {article.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {article.author.email}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contenu de l'article */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>

      {/* Section d'évaluation */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cet article vous a-t-il été utile ?</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              variant={hasVoted === 'helpful' ? 'default' : 'outline'}
              className="gap-2 transition-all hover:scale-105 active:scale-95"
              onClick={() => handleVote('helpful')}
              disabled={hasVoted !== null || isVoting}
            >
              <ThumbsUp className={`h-4 w-4 transition-transform ${hasVoted === 'helpful' ? 'animate-bounce' : ''}`} />
              Oui ({article.helpful})
            </Button>
            <Button 
              variant={hasVoted === 'notHelpful' ? 'default' : 'outline'}
              className="gap-2 transition-all hover:scale-105 active:scale-95"
              onClick={() => handleVote('notHelpful')}
              disabled={hasVoted !== null || isVoting}
            >
              <ThumbsDown className={`h-4 w-4 transition-transform ${hasVoted === 'notHelpful' ? 'animate-bounce' : ''}`} />
              Non ({article.notHelpful})
            </Button>
          </div>
          {hasVoted && (
            <p className="text-sm text-muted-foreground mt-3 animate-in fade-in slide-in-from-bottom-2">
              Merci pour votre retour !
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
