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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="space-y-8 px-6 py-8">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => router.push("/knowledge-base")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{article.title}</h1>
        </div>
      </div>

      {/* Métadonnées de l'article */}
      <Card className="shadow-lg border-2">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-wrap items-center gap-6 text-base text-muted-foreground">
            {article.category && (
              <Badge variant="secondary" className="text-sm px-4 py-2">{article.category.name}</Badge>
            )}
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span className="font-medium">{article.views.toLocaleString()} vues</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                Mis à jour le{" "}
                {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Auteur */}
          {article.author && (
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={article.author.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {article.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold">Par {article.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {article.author.email}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contenu de l'article */}
      <Card className="shadow-lg border-2">
        <CardContent className="pt-12 pb-12 px-12">
          <div
            className="prose prose-xl prose-slate dark:prose-invert max-w-none leading-relaxed"
            style={{ fontSize: '1.25rem', lineHeight: '1.9' }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Section d'évaluation */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <h3 className="text-xl font-semibold">Cet article vous a-t-il été utile ?</h3>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="flex items-center gap-6">
            <Button 
              variant={hasVoted === 'helpful' ? 'default' : 'outline'}
              size="lg"
              className="gap-3 transition-all hover:scale-105 active:scale-95 px-8 py-6 text-base"
              onClick={() => handleVote('helpful')}
              disabled={hasVoted !== null || isVoting}
            >
              <ThumbsUp className={`h-5 w-5 transition-transform ${hasVoted === 'helpful' ? 'animate-bounce' : ''}`} />
              Oui ({article.helpful})
            </Button>
            <Button 
              variant={hasVoted === 'notHelpful' ? 'default' : 'outline'}
              size="lg"
              className="gap-3 transition-all hover:scale-105 active:scale-95 px-8 py-6 text-base"
              onClick={() => handleVote('notHelpful')}
              disabled={hasVoted !== null || isVoting}
            >
              <ThumbsDown className={`h-5 w-5 transition-transform ${hasVoted === 'notHelpful' ? 'animate-bounce' : ''}`} />
              Non ({article.notHelpful})
            </Button>
          </div>
          {hasVoted && (
            <p className="text-base text-muted-foreground mt-4 animate-in fade-in slide-in-from-bottom-2">
              Merci pour votre retour !
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
