"use client"

import { UserAvatar } from "@/components/user-avatar"
import { UserOnlineStatus } from "@/components/user-online-status"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useUserStatus } from "@/hooks/use-user-status"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isOnline: boolean
  role?: string
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isIncoming?: boolean
}

interface UsersListProps {
  users: User[]
  selectedUserId?: string
  onUserSelect?: (user: User) => void
}

function UserListItem({ user, isSelected, onSelect }: { 
  user: User
  isSelected: boolean
  onSelect: (user: User) => void 
}) {
  const isOnline = useUserStatus(user.id)
  
  // Создаем обновленного пользователя с актуальным статусом
  const updatedUser = {
    ...user,
    isOnline // Используем актуальный статус из хука
  }

  return (
    <Card
      className={cn(
        "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
        isSelected && "bg-muted"
      )}
      onClick={() => onSelect(updatedUser)} // Передаем обновленного пользователя
    >
      <div className="flex items-center gap-3">
        <UserAvatar user={user} className="h-10 w-10" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">
              {user.name || "Пользователь"}
            </p>
            <UserOnlineStatus 
              isOnline={isOnline}
              showDot={true}
              className="ml-2"
            />
          </div>
          {user.email && (
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

export function UsersList({ users, selectedUserId, onUserSelect }: UsersListProps) {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserListItem
          key={user.id}
          user={user}
          isSelected={selectedUserId === user.id}
          onSelect={(user) => {
            if (onUserSelect) onUserSelect(user)
          }}
        />
      ))}
    </div>
  )
} 