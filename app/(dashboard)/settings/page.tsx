"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { User, Bell, Shield, Palette, Key, Smartphone, Save, Upload, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+33 6 12 34 56 78",
    department: "Support",
    jobTitle: "Agent de support",
  })

  const [notifications, setNotifications] = useState({
    pushNewTicket: true,
    pushChat: true,
    pushMention: true,
    pushSLA: true,
    soundEnabled: true,
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginNotifications: true,
  })

  const [preferences, setPreferences] = useState({
    language: "fr",
    timezone: "Europe/Paris",
    dateFormat: "dd/MM/yyyy",
    theme: "system",
    compactMode: false,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mise à jour du profil
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      })

      if (response.ok) {
        toast({
          title: "Paramètres enregistrés",
          description: "Vos modifications ont été sauvegardées avec succès.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.error || "Impossible de sauvegarder les modifications",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez vos préférences et votre compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Préférences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Photo de profil</CardTitle>
              <CardDescription>Votre photo sera visible par les autres utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Changer la photo
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Fonction</Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Notifications push
              </CardTitle>
              <CardDescription>Configurez les notifications en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nouveaux tickets</p>
                  <p className="text-sm text-muted-foreground">Notification instantanée pour les nouveaux tickets</p>
                </div>
                <Switch
                  checked={notifications.pushNewTicket}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushNewTicket: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Messages de chat</p>
                  <p className="text-sm text-muted-foreground">Notification pour les nouveaux messages</p>
                </div>
                <Switch
                  checked={notifications.pushChat}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushChat: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertes SLA</p>
                  <p className="text-sm text-muted-foreground">Notification avant expiration d'un SLA</p>
                </div>
                <Switch
                  checked={notifications.pushSLA}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushSLA: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sons de notification</p>
                  <p className="text-sm text-muted-foreground">Activer les sons pour les notifications</p>
                </div>
                <Switch
                  checked={notifications.soundEnabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, soundEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Mot de passe
              </CardTitle>
              <CardDescription>Modifiez votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Changer le mot de passe</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentification à deux facteurs
              </CardTitle>
              <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Activer la 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Utilisez une application d'authentification pour sécuriser votre compte
                  </p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                />
              </div>
              {security.twoFactorEnabled && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-32 w-32 bg-background rounded border flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">QR Code</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ou entrez ce code manuellement:</p>
                      <code className="text-sm bg-background px-2 py-1 rounded">XXXX-XXXX-XXXX-XXXX</code>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions actives</CardTitle>
              <CardDescription>Gérez vos sessions de connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Chrome sur MacOS</p>
                    <p className="text-sm text-muted-foreground">Paris, France - Session actuelle</p>
                  </div>
                </div>
                <Badge variant="secondary">Actif</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Safari sur iPhone</p>
                    <p className="text-sm text-muted-foreground">Paris, France - Il y a 2 jours</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive">
                  Révoquer
                </Button>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Déconnecter toutes les autres sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Langue et région</CardTitle>
              <CardDescription>Personnalisez l'affichage selon votre région</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (UTC)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Format de date</Label>
                <Select
                  value={preferences.dateFormat}
                  onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (25/01/2025)</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (01/25/2025)</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2025-01-25)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez l'interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mode compact</p>
                  <p className="text-sm text-muted-foreground">Réduire l'espacement pour afficher plus de contenu</p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  )
}
