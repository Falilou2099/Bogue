import { cn } from "@/lib/utils"
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { TicketPriority } from "@/lib/types"

interface PriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        PRIORITY_COLORS[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
