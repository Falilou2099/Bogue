"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Info, Check, CheckCheck } from "lucide-react"
import { mockTickets, mockTicketMessages, type mockUsers } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface Conversation {
  ticketId: string
  ticketTitle: string
  participant: (typeof mockUsers)[0]
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isTyping: boolean
}

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>("TKT-001")
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversations: Conversation[] = mockTickets.slice(0, 5).map((ticket, index) => ({
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    participant: ticket.assignedTo || ticket.createdBy!,
    lastMessage: mockTicketMessages.find((m) => m.ticketId === ticket.id)?.content || "Nouveau ticket",
    lastMessageTime: new Date(Date.now() - index * 3600000),
    unreadCount: index === 0 ? 2 : index === 1 ? 1 : 0,
    isTyping: index === 0,
  }))

  const filteredConversations = conversations.filter(
    (c) =>
      c.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConvo = conversations.find((c) => c.ticketId === selectedConversation)
  const messages = mockTicketMessages.filter((m) => m.ticketId === selectedConversation && m.type === "public")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return
    // In real app, send message via WebSocket
    setMessage("")
  }

  const getTimeDisplay = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations List */}
      <Card className="w-80 shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredConversations.map((convo) => (
              <button
                key={convo.ticketId}
                onClick={() => setSelectedConversation(convo.ticketId)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                  selectedConversation === convo.ticketId ? "bg-primary/10" : "hover:bg-accent",
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={convo.participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {convo.participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{convo.participant.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {getTimeDisplay(convo.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{convo.ticketId}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.isTyping ? (
                        <span className="text-primary italic">En train d'écrire...</span>
                      ) : (
                        convo.lastMessage
                      )}
                    </p>
                    {convo.unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 justify-center px-1.5 shrink-0">{convo.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      {selectedConvo ? (
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConvo.participant.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedConvo.participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConvo.participant.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConvo.ticketId} - {selectedConvo.ticketTitle.slice(0, 40)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Date separator */}
              <div className="flex items-center gap-4 my-6">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">Aujourd'hui</span>
                <Separator className="flex-1" />
              </div>

              {messages.map((msg) => {
                const isOwn = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {msg.sender?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[70%]", isOwn && "items-end")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5",
                          isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className={cn("flex items-center gap-1 mt-1", isOwn && "justify-end")}>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isOwn &&
                          (msg.readBy.length > 1 ? (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          ))}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {selectedConvo.isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={selectedConvo.participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedConvo.participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Écrivez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        </Card>
      )}
    </div>
  )
}
