"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Shield,
  Search,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  UserCog,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"
import { ru } from "date-fns/locale"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RoleStats } from "./components/role-stats"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  lastActive: string | null
}

interface RoleChange {
  id: string
  userId: string
  oldRole: string
  newRole: string
  changedBy: {
    id: string
    name: string | null
    email: string | null
  }
  createdAt: string
  reason?: string
}

interface RoleStats {
  totalChanges: number
  roleDistribution: {
    ADMIN: number
    MANAGER: number
    USER: number
  }
  recentChanges: {
    date: string
    count: number
  }[]
  topChangers: {
    id: string
    name: string
    count: number
  }[]
  averageTimeInRole: number
}

export default function RolesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [roleHistory, setRoleHistory] = useState<RoleChange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [changeReason, setChangeReason] = useState("")
  const [stats, setStats] = useState<RoleStats | null>(null)

  useEffect(() => {
    loadUsers()
    loadRoleHistory()
    loadStats()
  }, [])

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to load users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Не удалось загрузить пользователей')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadRoleHistory() {
    try {
      const response = await fetch('/api/admin/roles/history')
      if (!response.ok) throw new Error('Failed to load role history')
      const data = await response.json()
      setRoleHistory(data)
    } catch (error) {
      console.error('Error loading role history:', error)
      toast.error('Не удалось загрузить историю изменений ролей')
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/roles/stats')
      if (!response.ok) throw new Error('Failed to load stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Не удалось загрузить статистику')
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (!changeReason.trim()) {
      toast.error('Необходимо указать причину изменения роли')
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: newRole,
          reason: changeReason 
        })
      })

      if (!response.ok) throw new Error('Failed to update role')

      // Обновляем список пользователей
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      // Обновляем историю изменений
      await loadRoleHistory()

      toast.success('Роль пользователя обновлена')
      setSelectedUser(null)
      setChangeReason("")
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Не удалось обновить роль')
    }
  }

  async function handleExport() {
    try {
      const response = await fetch('/api/admin/roles/export')
      if (!response.ok) throw new Error('Failed to export data')
      
      // Получаем blob из ответа
      const blob = await response.blob()
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `role_changes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`
      
      // Добавляем ссылку в DOM и кликаем по ней
      document.body.appendChild(a)
      a.click()
      
      // Очищаем
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Экспорт успешно завершен')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Не удалось экспортировать данные')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const matchesRole = !selectedRole || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'MANAGER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Управление ролями</h2>
          <p className="text-sm text-muted-foreground">
            Управление ролями пользователей и просмотр истории изменений
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? <UserCog className="h-4 w-4 mr-2" /> : <History className="h-4 w-4 mr-2" />}
            {showHistory ? 'Показать пользователей' : 'Показать историю'}
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && <RoleStats stats={stats} />}

      {/* Поиск и фильтры */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={showHistory ? "Поиск по истории..." : "Поиск пользователей..."}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedRole || "all"}
          onValueChange={(value) => setSelectedRole(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все роли" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="ADMIN">Администратор</SelectItem>
            <SelectItem value="MANAGER">Менеджер</SelectItem>
            <SelectItem value="USER">Пользователь</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showHistory ? (
        <Card>
          <CardHeader>
            <CardTitle>История изменений ролей</CardTitle>
            <CardDescription>
              Последние изменения ролей пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleHistory.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="p-2 rounded-full bg-muted">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      Изменение роли пользователя
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {change.reason || "Причина не указана"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={getRoleBadgeVariant(change.oldRole)}>
                        {change.oldRole}
                      </Badge>
                      <span>→</span>
                      <Badge variant={getRoleBadgeVariant(change.newRole)}>
                        {change.newRole}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(change.createdAt), {
                        addSuffix: true,
                        locale: ru
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {change.changedBy.name || change.changedBy.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={user}
                        className="h-8 w-8"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name || 'Без имени'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastActive ? (
                      formatDistanceToNow(new Date(user.lastActive), {
                        addSuffix: true,
                        locale: ru
                      })
                    ) : (
                      'Никогда'
                    )}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Изменить роль
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Изменить роль пользователя
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы собираетесь изменить роль пользователя {user.name || user.email}.
                            Это действие будет записано в истории изменений.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Новая роль
                            </label>
                            <Select
                              onValueChange={(value) => setSelectedUser(prev => 
                                prev ? { ...prev, role: value } : null
                              )}
                              value={selectedUser?.role}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите роль" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Администратор</SelectItem>
                                <SelectItem value="MANAGER">Менеджер</SelectItem>
                                <SelectItem value="USER">Пользователь</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Причина изменения
                            </label>
                            <Input
                              placeholder="Укажите причину изменения роли"
                              value={changeReason}
                              onChange={(e) => setChangeReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => {
                            setSelectedUser(null)
                            setChangeReason("")
                          }}>
                            Отмена
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (selectedUser) {
                                handleRoleChange(selectedUser.id, selectedUser.role)
                              }
                            }}
                          >
                            Подтвердить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 