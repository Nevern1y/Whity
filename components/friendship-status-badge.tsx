"use client"

import { cn } from "@/lib/utils"
import { UserCheck, UserPlus, Clock, Ban } from "lucide-react"
import { FRIENDSHIP_STATUS_LABELS, ExtendedFriendshipStatus } from "@/lib/constants"

interface FriendshipStatusBadgeProps {
  status: ExtendedFriendshipStatus
  isIncoming?: boolean
  className?: string
}

export const FriendshipStatusBadge = ({
  status,
  isIncoming,
  className
}: FriendshipStatusBadgeProps) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
      status === 'ACCEPTED' && "bg-green-100 text-green-700",
      status === 'PENDING' && "bg-yellow-100 text-yellow-700",
      status === 'REJECTED' && "bg-red-100 text-red-700",
      status === 'NONE' && "bg-gray-100 text-gray-700",
      className
    )}>
      {status === 'ACCEPTED' && <UserCheck className="w-3 h-3" />}
      {status === 'PENDING' && <Clock className="w-3 h-3" />}
      {status === 'REJECTED' && <Ban className="w-3 h-3" />}
      {status === 'NONE' && <UserPlus className="w-3 h-3" />}
      <span>
        {isIncoming && status === 'PENDING' 
          ? 'Входящая заявка' 
          : FRIENDSHIP_STATUS_LABELS[status]
        }
      </span>
    </div>
  )
} 