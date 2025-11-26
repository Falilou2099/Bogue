"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, CheckCircle2, MessageSquare, AlertTriangle, User, Trash2, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const notifications = [
  {
    id: "1",
    type: "ticket_assigned",
    title: "Nouveau ticket assigné",
    message: "Le ticket #TKT-2024-0089 vous a été assigné",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "message",
    title: "Nouveau message",
    message: "Jean Dupont a répondu sur le ticket #TKT-2024-0087",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    type: "sla_warning",
    title: "Alerte SLA",
    message: "Le ticket #TKT-2024-0085 approche de son délai SLA (1h restante)",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "4",
    type: "ticket_resolved",
    title: "Ticket résolu",
    message: "Le ticket #TKT-2024-0082 a été marqué comme résolu",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "5",
    type: "mention",
    title: "Vous avez été mentionné",
    message: "Marie Martin vous a mentionné dans un commentaire",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "6",
    type: "ticket_assigned",
    title: "Ticket réassigné",
    message: "Le ticket #TKT-2024-0078 a été réassigné à Sophie Bernard",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "ticket_assigned":
      return <Bell className="h-5 w-5 text-blue-500" />
    case "message":
      return <MessageSquare className="h-5 w-5 text-green-500" />
    case "sla_warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case "ticket_resolved":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case "mention":
      return <User className="h-5 w-5 text-purple-500" />
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />
  }
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const unreadCount = notifs.filter((n) => !n.read).length
  const unreadNotifs = notifs.filter((n) => !n.read)
  const readNotifs = notifs.filter((n) => n.read)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const markAsRead = (ids: string[]) => {
    setNotifs((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)))
    setSelectedIds([])
  }

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteSelected = () => {
    setNotifs((prev) => prev.filter((n) => !selectedIds.includes(n.id)))
    setSelectedIds([])
  }

  const NotificationItem = ({ notification }: { notification: (typeof notifications)[0] }) => (
    <div className={`flex items-start gap-4 p-4 border-b last:border-0 ${!notification.read ? "bg-primary/5" : ""}`}>
      <Checkbox checked={selectedIds.includes(notification.id)} onCheckedChange={() => toggleSelect(notification.id)} />
      <div className="p-2 rounded-full bg-muted">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
            {notification.title}
          </p>
          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: fr })}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => markAsRead([notification.id])} disabled={notification.read}>
        <CheckCircle2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : "Toutes les notifications sont lues"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => markAsRead(selectedIds)}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Marquer comme lu
              </Button>
              <Button variant="outline" size="sm" onClick={deleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Toutes
            <Badge variant="secondary" className="ml-2">
              {notifs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues
            {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="read">Lues</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {notifs.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium">Aucune notification</h3>
                </div>
              ) : (
                notifs.map((notification) => <NotificationItem key={notification.id} notification={notification} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardContent className="p-0">
              {unreadNotifs.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium">Tout est lu</h3>
                  <p className="text-muted-foreground">Vous êtes à jour</p>
                </div>
              ) : (
                unreadNotifs.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="read">
          <Card>
            <CardContent className="p-0">
              {readNotifs.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium">Aucune notification lue</h3>
                </div>
              ) : (
                readNotifs.map((notification) => <NotificationItem key={notification.id} notification={notification} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
