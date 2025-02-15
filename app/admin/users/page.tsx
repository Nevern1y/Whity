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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MoreHorizontal, Search, UserPlus, Shield, 
  Trash2, Mail, Clock, Activity 
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: RoleType
  createdAt: string
  lastActive: string | null
  isOnline: boolean
}

const ROLES = {
  ADMIN: {
    label: "Администратор",
    value: "ADMIN" as const,
    badge: "destructive",
    description: "Полный доступ ко всем функциям"
  },
  MANAGER: {
    label: "Менеджер",
    value: "MANAGER" as const,
    badge: "default",
    description: "Управление контентом"
  },
  USER: {
    label: "Пользователь",
    value: "USER" as const,
    badge: "secondary",
    description: "Стандартный доступ"
  }
} as const

type RoleType = "ADMIN" | "MANAGER" | "USER" | "ALL"

interface RoleChangeDialog {
  isOpen: boolean
  userId: string | null
  currentRole: RoleType | null
  newRole: RoleType | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleType>("ALL")
  const [roleChangeDialog, setRoleChangeDialog] = useState<RoleChangeDialog>({
    isOpen: false,
    userId: null,
    currentRole: null,
    newRole: null
  })
  const [reason, setReason] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to load users')
      const data = await response.json()
      setUsers(data.map((user: any) => ({
        ...user,
        role: user.role as RoleType
      })))
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Не удалось загрузить пользователей')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: RoleType) {
    const user = users.find(u => u.id === userId)
    if (!user) return

    setRoleChangeDialog({
      isOpen: true,
      userId,
      currentRole: user.role,
      newRole
    })
  }

  async function handleRoleChangeConfirm() {
    if (!roleChangeDialog.userId || !roleChangeDialog.newRole || !reason.trim()) return

    try {
      const response = await fetch(`/api/admin/users/${roleChangeDialog.userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: roleChangeDialog.newRole,
          reason: reason.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update role')
      }

      setUsers(users.map(user => 
        user.id === roleChangeDialog.userId && roleChangeDialog.newRole
          ? { ...user, role: roleChangeDialog.newRole }
          : user
      ))

      toast.success('Роль пользователя обновлена')
      
      setRoleChangeDialog({
        isOpen: false,
        userId: null,
        currentRole: null,
        newRole: null
      })
      setReason("")
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить роль')
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete user')

      setUsers(users.filter(user => user.id !== userId))
      toast.success('Пользователь удален')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Не удалось удалить пользователя')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

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
          <h2 className="text-2xl font-bold tracking-tight">Пользователи</h2>
          <p className="text-sm text-muted-foreground">
            Управление пользователями и их ролями
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователей..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedRole}
          onValueChange={(value: RoleType) => setSelectedRole(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все роли" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все роли</SelectItem>
            {Object.entries(ROLES).map(([key, role]) => (
              <SelectItem key={key} value={role.value}>
                <div className="flex items-center gap-2">
                  <Badge variant={role.badge as any}>
                    {role.label}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead>Последняя активность</TableHead>
              <TableHead className="w-[70px]"></TableHead>
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
                  <Badge variant={ROLES[user.role as keyof typeof ROLES]?.badge as any || "secondary"}>
                    {ROLES[user.role as keyof typeof ROLES]?.label || user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm">
                      {user.isOnline ? 'Онлайн' : 'Оффлайн'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                    locale: ru
                  })}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Действия</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = `/profile/${user.id}`}>
                        <Activity className="h-4 w-4 mr-2" />
                        Профиль
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Написать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Изменить роль
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as RoleType)}
                        >
                          <SelectTrigger className="ml-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLES).map(([key, role]) => (
                              <SelectItem key={key} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <Badge variant={role.badge as any}>
                                    {role.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {role.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Удалить пользователя?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить. Пользователь будет удален вместе со всеми его данными.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog 
        open={roleChangeDialog.isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setRoleChangeDialog({
              isOpen: false,
              userId: null,
              currentRole: null,
              newRole: null
            })
            setReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменение роли пользователя</DialogTitle>
            <DialogDescription>
              Укажите причину изменения роли с {
                ROLES[roleChangeDialog.currentRole as keyof typeof ROLES]?.label
              } на {
                ROLES[roleChangeDialog.newRole as keyof typeof ROLES]?.label
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Укажите причину изменения роли..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRoleChangeDialog({
                  isOpen: false,
                  userId: null,
                  currentRole: null,
                  newRole: null
                })
                setReason("")
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleRoleChangeConfirm}
              disabled={!reason.trim()}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 