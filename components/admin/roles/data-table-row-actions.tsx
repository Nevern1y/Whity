"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pen, Shield, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "./columns"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertDialogAction } from "@/components/ui/alert-dialog-action"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface DataTableRowActionsProps {
  row: Row<User>
}

const ROLES = [
  {
    label: "Администратор",
    value: "ADMIN",
  },
  {
    label: "Менеджер",
    value: "MANAGER",
  },
  {
    label: "Пользователь",
    value: "USER",
  },
]

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newRole, setNewRole] = useState<string>()
  const [reason, setReason] = useState("")

  async function onDelete() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${row.original.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Что-то пошло не так")
      }

      toast.success("Пользователь успешно удален")
      router.refresh()
    } catch (error) {
      toast.error("Не удалось удалить пользователя")
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  async function onRoleChange() {
    if (!newRole || !reason.trim()) {
      toast.error("Заполните все поля")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${row.original.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
          reason: reason.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Что-то пошло не так")
      }

      toast.success("Роль успешно изменена")
      router.refresh()
    } catch (error) {
      toast.error("Не удалось изменить роль")
    } finally {
      setIsLoading(false)
      setShowRoleDialog(false)
      setNewRole(undefined)
      setReason("")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Открыть меню</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            <Shield className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Изменить роль
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
          >
            <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите удалить этого пользователя?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все данные пользователя будут удалены
              безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить роль пользователя</DialogTitle>
            <DialogDescription>
              Выберите новую роль для пользователя и укажите причину изменения.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Роль</Label>
              <Select
                value={newRole}
                onValueChange={setNewRole}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      disabled={role.value === row.original.role}
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Причина изменения</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Укажите причину изменения роли"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRoleDialog(false)
                setNewRole(undefined)
                setReason("")
              }}
            >
              Отмена
            </Button>
            <Button onClick={onRoleChange} disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 