"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Ticket, Loader2, Check } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [consent, setConsent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push("/login?registered=true")
      } else {
        setError(data.error || "Erreur lors de la création du compte")
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { label: "Au moins 12 caractères", met: password.length >= 12 },
    { label: "Une majuscule", met: /[A-Z]/.test(password) },
    { label: "Une minuscule", met: /[a-z]/.test(password) },
    { label: "Un chiffre", met: /[0-9]/.test(password) },
    { label: "Un caractère spécial", met: /[@$!%*?&]/.test(password) },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>Rejoignez TicketFlow et commencez à gérer vos tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div
                        className={`h-4 w-4 rounded-full flex items-center justify-center ${req.met ? "bg-green-500" : "bg-muted"}`}
                      >
                        {req.met && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={req.met ? "text-green-500" : "text-muted-foreground"}>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox 
                id="consent" 
                className="mt-1" 
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
                J'accepte que mes données personnelles (nom, email) soient utilisées pour la gestion de mon compte et l'envoi de notifications liées à mes tickets. Consultez notre{" "}
                <Link href="/legal" className="text-primary hover:underline font-medium">
                  politique de confidentialité
                </Link>
                .
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !consent}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
            </Button>
          </form>
          <div className="mt-6 space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <Link href="/legal" className="hover:underline">
                Mentions légales & Confidentialité
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
