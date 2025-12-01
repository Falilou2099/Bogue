"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Mentions Légales & Politique de Confidentialité</h1>
        </div>

        {/* Mentions Légales */}
        <Card>
          <CardHeader>
            <CardTitle>Mentions Légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Éditeur du site</h3>
              <p className="text-sm text-muted-foreground">
                TicketFlow - Application de gestion de tickets<br />
                Projet académique - Formation Sécurité des Applications Web<br />
                Contact : support@ticketflow.com
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Hébergement</h3>
              <p className="text-sm text-muted-foreground">
                Ce site est hébergé par Vercel Inc.<br />
                340 S Lemon Ave #4133, Walnut, CA 91789, USA
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Propriété intellectuelle</h3>
              <p className="text-sm text-muted-foreground">
                L'ensemble du contenu de ce site (textes, images, code source) est protégé par le droit d'auteur.
                Toute reproduction est interdite sans autorisation préalable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Politique de Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle>Politique de Confidentialité (RGPD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Données collectées</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>Nom</strong> : Pour personnaliser votre expérience</li>
                <li><strong>Email</strong> : Pour l'authentification et les notifications</li>
                <li><strong>Mot de passe</strong> : Stocké de manière sécurisée (hachage bcrypt)</li>
                <li><strong>Rôle</strong> : Pour gérer les permissions d'accès</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Finalité du traitement</h3>
              <p className="text-sm text-muted-foreground">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Gérer votre compte utilisateur</li>
                <li>Vous permettre de créer et suivre vos tickets</li>
                <li>Vous envoyer des notifications liées à vos tickets</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Durée de conservation</h3>
              <p className="text-sm text-muted-foreground">
                Vos données sont conservées tant que votre compte est actif.
                En cas de suppression de compte, vos données personnelles sont effacées sous 30 jours.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Vos droits (RGPD)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>Droit d'accès</strong> : Consulter vos données personnelles</li>
                <li><strong>Droit de rectification</strong> : Modifier vos informations</li>
                <li><strong>Droit à l'effacement</strong> : Supprimer votre compte</li>
                <li><strong>Droit à la portabilité</strong> : Exporter vos données</li>
                <li><strong>Droit d'opposition</strong> : Refuser certains traitements</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Pour exercer ces droits, contactez-nous à : <strong>privacy@ticketflow.com</strong>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Sécurité des données</h3>
              <p className="text-sm text-muted-foreground">
                Nous mettons en œuvre toutes les mesures techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Chiffrement des mots de passe (bcrypt avec 12 rounds)</li>
                <li>Connexion HTTPS sécurisée</li>
                <li>Cookies sécurisés (HttpOnly, Secure, SameSite)</li>
                <li>Protection contre les injections SQL (ORM Prisma)</li>
                <li>Protection XSS et CSRF</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Nous utilisons uniquement un cookie de session pour maintenir votre authentification.
                Ce cookie est strictement nécessaire au fonctionnement du service et expire après 30 minutes d'inactivité.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">7. Partage des données</h3>
              <p className="text-sm text-muted-foreground">
                Vos données ne sont <strong>jamais vendues ni partagées</strong> avec des tiers.
                Elles restent stockées sur nos serveurs sécurisés.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">8. Modifications</h3>
              <p className="text-sm text-muted-foreground">
                Cette politique peut être mise à jour. La date de dernière modification est indiquée ci-dessous.
                Nous vous informerons de tout changement significatif.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Dernière mise à jour :</strong> 1er décembre 2025
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Retour */}
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
