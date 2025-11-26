"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { MessageSquare, Paperclip, Clock } from "lucide-react"
import type { Ticket } from "@/lib/types"

interface TicketListItemProps {
  ticket: Ticket
  onClick?: () => void
}

export function TicketListItem({ ticket, onClick }: TicketListItemProps) {
  return (
    <Card className="p-4 hover:bg-accent/50 cursor-pointer transition-colors" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h3 className="font-medium text-card-foreground truncate">{ticket.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{ticket.description}</p>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>12</span>
          </div>
          {ticket.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{ticket.attachments.length}</span>
            </div>
          )}
          <Avatar className="h-6 w-6">
            <AvatarImage src="/agent-avatar.png" alt="Agent" />
            <AvatarFallback className="text-[10px]">AG</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            Créé le{" "}
            {new Date(ticket.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        {ticket.category && <span className="px-2 py-0.5 bg-secondary rounded-md">{ticket.category.name}</span>}
      </div>
    </Card>
  )
}
