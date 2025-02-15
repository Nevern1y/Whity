"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { UsersList } from "@/components/users-list"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearch = useDebounce(query, 300)
  const { data: session } = useSession()
  const router = useRouter()

  // Search users when debounced query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([])
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}`)
        if (!response.ok) throw new Error('Failed to search users')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    searchUsers()
  }, [debouncedSearch])

  const handleUserSelect = (user: any) => {
    router.push(`/messages?userId=${user.id}`)
  }

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold mb-6">Поиск пользователей</h1>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по имени или email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <span>Загрузка...</span>
          </div>
        ) : users.length > 0 ? (
          <UsersList
            users={users}
            onUserSelect={handleUserSelect}
          />
        ) : query ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Пользователи не найдены</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Введите имя или email для поиска</p>
          </div>
        )}
      </Card>
    </div>
  )
} 